# Manual Brain for iPhone

A native SwiftUI client for this same app — no new backend, it talks to the
existing Next.js API routes (`app/api/**`) over the same shared-password
session cookie the web dashboard uses. It's the production implementation of
the **`ui_kits/ios/`** click-through prototype from the
[Manual Brain Design System](https://github.com/willhall020-lgtm/manual-brain)
project's Claude Design export (see that bundle's `README.md` and
`chats/chat1.md` + `chats/chat2.md` for the full design brief and how it
evolved) — five tabs: **chat · today · tomorrow · lists · settings**, built
from that design system's tokens, component vocabulary and copy rules, and
grounded in this repo's real data model rather than the prototype's own
in-browser mock state.

## Setup

This repo ships the project as a plain-text [XcodeGen](https://github.com/yonaskolb/XcodeGen)
spec (`project.yml`), not a binary `.xcodeproj` — that keeps the project
diffable in a PR the way the rest of this repo is, the same reasoning
`lib/schema.sql` gives for staying hand-written SQL instead of an ORM's
generated migration.

```bash
brew install xcodegen   # once
cd ios/ManualBrain
xcodegen generate
open ManualBrain.xcodeproj
```

Then, in Xcode: pick your own Team under Signing & Capabilities (the spec
leaves `DEVELOPMENT_TEAM` blank), and Run on a simulator or device. On first
launch the app talks to `https://www.manualbrain.xyz` (this repo's own
deployed instance, from the root README) — open the login screen's
**server** disclosure to point it at a different deploy (e.g.
`http://localhost:3000` for local dev against `npm run dev`; note the app
requires HTTPS by default via `NSAppTransportSecurity`, so point it at a
`https://` tunnel or relax that exception locally if you need plain HTTP).

## What this app is not

It adds **zero** new backend logic. Three small, additive, read-only-ish
endpoints were added to the Next.js app alongside it, because the web app's
`/settings` and calendar sidebar are Server Components that render their
data as HTML props — a non-browser client needs the same data as JSON
instead:

| Added | Mirrors |
| --- | --- |
| `GET /api/calendar` | `app/page.tsx`'s server-side `getCalendarEvents()` call |
| `GET /api/settings` | `app/settings/page.tsx`'s server-side reads (Google Calendar status, planning rules) |
| `GET /api/preferences` | the planning-rules half of the same page (POST already existed) |

One small **write** capability was also added: `PATCH /api/tasks/[id]` now
accepts a `sectionId` field to move a task to a different list. The web
dashboard has no UI for that today, but the design kit's task-edit sheet
does ("which list?" is editable there, same as at creation) — see
`components/mobile/TaskSheet.jsx` in the design bundle — so the endpoint
needed to exist for this app's edit sheet to be more than decorative.

Everything else — tasks, sections, chat, booking, auth — is the existing
API, unchanged.

## What changed from the `ui_kits/ios/` prototype

The design bundle's own README (`README.md` at its root) says exactly when
to defer to it and when not to: *"The attached kit is the ground truth...
[but] never recreate UIs from screenshots alone unless you have no other
choice."* The prototype kit predates real due dates in this repo — it
modeled the *old* fixed urgency-bucket scheme (Today / 2–3 days / End of
this week / This month / Custom) and screenshot-sourced scheduling fields
that hadn't shipped in code yet. Both of those are now real (see
`lib/due-date.ts`, `lib/repeat.ts`, `schema.sql`), so this app is grounded in
**this repo's current code**, not the prototype's older mock state, exactly
as the design bundle's own instructions direct:

- **"Tomorrow" is now a literal date filter**, not the prototype's invented
  "near horizon" (2–3 days + end of week) — the design kit's own README
  said this explicitly: *"If you add real dates upstream it becomes a true
  date filter."* They were added; it is one now.
- **Due date replaces the urgency picker** in the add/edit sheets — a
  "today" quick-pick plus a native date picker (mirroring
  `DueDatePicker.tsx` on the web), with **repeat** only offered once a date
  is actually set, matching `lib/repeat.ts`'s own rule that a repeat
  frequency is meaningless without a date to advance from.
- **Settings drops the prototype's invented `urgency labels` (pill/dot) and
  `quick add` (shown/hidden) toggles.** Those were speculative constants in
  an early build of `Dashboard.tsx`, flagged there as "in case they need to
  become real settings later" — but urgency buckets don't exist in the
  schema any more, and neither constant is exposed by any API today. In
  their place: the real Google Calendar **write-access** connect/reconnect
  flow (`app/settings/page.tsx`, OAuth) and the real **planning rules**
  editor (`lib/preferences.ts`) — both live, working settings the prototype
  didn't have yet because they hadn't been built when it was designed.
- **The paperclip / attachment indicator and the invented "repeat" chip
  pattern** from the design bundle's own "Known gaps" section were
  screenshot-sourced or invented UI with no backing field in this schema at
  all (no attachment concept exists here) — carried forward as *not built*,
  same as the bundle documents them.

Everything else — the lime "for today" block, the type-led tab bar with a
lime underline, absolute lowercase copy (`textCase(.lowercase)`, applied at
display time only — see `DesignSystem/Typography.swift`), the ten-glyph
icon system, 44pt touch targets, the warm greige palette, Archivo type — is
carried over faithfully from the design system's tokens
(`tokens/*.css` in that project).

## Known gaps / simplifications

Written in the same spirit as the design bundle's own `readme.md` § Known
gaps — flagged rather than silently shipped:

- **Archivo isn't vendored.** Same situation the web app's own
  `tokens/fonts.css` documents (`@import`ed from Google Fonts, no local
  files) — `DesignSystem/Typography.swift` falls back to the system font at
  a matching weight when the four Archivo `.ttf`/`.otf` files aren't in the
  bundle. Add them to the target (and `UIAppFonts` in Info.plist) to pick up
  the real typeface.
- **No app icon.** The design system's own rule: *"if the provided sources
  contain no logo, do not create one."* There is no Manual Brain logo
  anywhere in this project, so `Assets.xcassets/AppIcon.appiconset` is an
  empty slot rather than a drawn mark — add a real one before shipping to a
  device's home screen or the App Store.
- **Google Calendar connect hands off to the system browser**, not an
  in-app flow. The OAuth redirect URI is pinned to this deploy's own domain
  in the Google Cloud Console credential (see the root README's Deployed
  section) — a custom URL scheme callback would need a second registered
  redirect URI there, which this change can't do on its own. Settings'
  "connect"/"reconnect" opens `/api/auth/google/start` in Safari, same
  landing page the web `/settings` link uses; coming back to the app and
  pulling to refresh picks up the new connected state.
- **Mutations are request-then-refresh, not optimistic.** `Dashboard.tsx`
  updates local state immediately and rolls back on failure; `AppStore`
  here awaits the server's response first. Simpler to get right without a
  physical device to test race conditions against — see `AppStore.swift`'s
  header comment.
- **The book pill's 44pt hit target is approximate.** The web version
  solves "big tap target, zero layout cost inside a wrapping row" with a
  `.mb-hit::after` pseudo-element (readme.md § Touch targets); SwiftUI has
  no exact equivalent inside a wrapping `HStack`-style flow layout, so
  `Components/TaskMetaRow.swift`'s `BookPill` just uses generous padding
  instead of a guaranteed 44pt box. Every *other* control (`CheckCircle`,
  chips, buttons) does hit the real 44pt floor.
- **Moving a task between lists** is new (see the `sectionId` PATCH support
  above) and only exercised by this app's task-edit sheet — worth a second
  look before it's trusted as a stable API contract.

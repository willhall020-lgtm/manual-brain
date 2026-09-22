# UI kit — Manual Brain for iPhone

A **new** surface, not a recreation: the repo has no iOS client (only the
task *"manual brain ios app design"* in Personal projects). Every value comes
from this design system — no new colours, no new typeface, no new radii, no
icon set.

It is assembled from the system's `components/mobile/` layer
(`MobileNavBar`, `MobileTaskRow`, `MobileListRow`, `TabBar`, `Sheet`,
`AddSheet`, `UrgencySheet`) plus the shared primitives (`TodayBlock`,
`DonePanel`, `AddListCard`, `Eyebrow`, `CheckCircle`, `UrgencyPill`).

| File | What it is |
| --- | --- |
| `index.html` | The clickable kit inside an iPhone frame. |
| `IosApp.jsx` | Navigation + state: tabs, list drill-down, add sheet, urgency sheet, chat, done. |
| `screens.jsx` | `ChatScreen`, `TodayScreen`, `TomorrowScreen`, `ListsScreen`, `ListDetailScreen`, `SettingsScreen`. |
| `chat.jsx` | The chat brain: system prompt built from the live task list, `askBrain()`. |
| `parts.jsx` | `MAddStrip` — the one mobile part the system doesn't ship. |
| `ios-frame.jsx` | Device bezel, status bar, home indicator. |
| Seed data | Shared with the web kit (`../dashboard/seed.jsx`). |

## The four tabs

| Tab | What's on it |
| --- | --- |
| **CHAT** | The assistant. Empty state offers three dashed starter prompts; replies stream into ink/white bubbles. |
| **TODAY** | Lime "for today" block → Done panel → today's calendar at the bottom. |
| **TOMORROW** | What's close but not today (the `2–3 days` and `End of this week` buckets), then tomorrow's calendar. |
| **LISTS** | Full-width list rows with due counts → tap through to a list. |
| **⚙︎** | The two settings the repo actually anticipates, plus the calendar source and log out. A glyph, not a word, so it doesn't compete with the four day-to-day tabs. |

## Flows you can click

1. **Chat** — tap a suggestion or type. The assistant gets a system prompt
   built from the live task list plus Manual Brain's voice rules, so it
   answers in the product's tone and only uses the five real urgency labels.
   Calls `window.claude.complete`; if the host doesn't provide it, a canned
   reply keeps the kit demoable offline.
2. **Today** — tap a ring to complete (drops into Done; undo from there).
   Calendar sits under the tasks, read-only.
3. **+ Add something for today** → the **add sheet**: title, which list, how
   urgent, optional custom label. ADD TASK stays grey until there's text.
4. **Tomorrow** — tap a row's urgency pill to re-file it; setting a task to
   `Today` moves it into the lime block on the today tab.
5. **Tap any task** to open the **task sheet** and edit it: rename, move it
   to another list, change urgency, set a due date, duration, time of day or
   repeat — plus "mark it done" at the top and "delete this task" at the
   bottom. Save commits; cancel discards.
6. **List detail** — tap a row's urgency pill for the **urgency sheet** as a
   shortcut when urgency is all you're changing. "+ Add task" opens the add
   sheet pre-filled with that list.
7. **Settings** — both controls are live, not decorative: switching urgency
   labels to **dot** shrinks every pill across the app, and setting quick add
   to **hidden** removes the add strip from the today block. They mirror
   `URGENCY_DISPLAY` and `SHOW_QUICK_ADD` in the repo's `Dashboard.tsx`.

### On "Tomorrow"

Manual Brain has no dates — urgency is five relative labels — so a literal
"due tomorrow" query is impossible. The tab therefore shows the *near
horizon* (`2–3 days` + `End of this week`) alongside tomorrow's calendar,
and its job is triage: re-file anything via its urgency pill. If real dates are
added upstream, this becomes a genuine date filter.

## How the desktop system was adapted

- **Rows go two-line.** Title on line one, list tag or urgency pill beside
  it, 56pt+ tall, 24pt check ring, every control in a ≥44pt box.
- **The card grid becomes full-width rows** — `minmax(232px, 1fr)` can't
  work one-handed, so counts move under the title.
- **The tab bar is type, not icons.** Manual Brain has no icon set, so the
  four tabs are uppercase eyebrow labels; the active one is marked by a
  lime rule — the same lime that means "now" and "today" everywhere else.
- **Chat borrows, it doesn't invent.** Bubbles reuse the 16px add-box radius
  (one corner dropped to 5px), the composer's send button follows
  `AddButton`'s grey-until-ready rule, and the starter prompts reuse the
  dashed-ghost language of the add strips.
- **Editing is a sheet, not an inline field.** The web rows carry a 25px
  `✎` glyph; that's below the 44pt floor, so mobile drops it and makes the
  whole row title the edit target. `TaskSheet` shares its option lists with
  `AddSheet` by importing them, so the two can't drift apart.
- **Sheets are the one mobile-only pattern.** The desktop system has no
  modals; on a phone a hover-anchored dropdown can't work, so `Sheet`
  introduces a bottom sheet with a grabber and a 28% ink scrim. That scrim
  is the only one in the system — noted in readme.md § Visual foundations.
- **One loud thing still holds:** the lime block is the only saturated
  surface on any screen.

## Not designed (would be invention)

Swipe actions, pull-to-refresh, widgets, notifications, onboarding, sign-in,
and the parts of the screenshots that carry no values in the repo (task
durations, time-of-day, calendar booking).

# Manual Brain

A low-friction, high-contrast task tracker built for an ADHD brain: three
default lists, real due dates (a one-click "Today", or pick any date — see
`lib/due-date.ts`), a "for today" view so you never have to see the whole
backlog at once — driven entirely by due date, so an unfinished task rolls
forward on its own each day rather than needing to be re-triaged, still
showing its real (now past) due date — a live read-only Google Calendar
sidebar, and an in-site chat that does what a Slack routine used to — reads
your tasks, decides what to book today, and puts it on the calendar itself.

This is the real implementation of the `Manual Brain Dashboard.dc.html`
design exported from Claude Design — see that project's `README.md` and
`chats/chat1.md` for the design brief and how it evolved.

## Stack

- **Next.js** (App Router, TypeScript) — the dashboard is a Server
  Component that loads the initial state from the database; a client
  component (`components/Dashboard.tsx`) handles all the interaction and
  talks to a small set of API routes for every mutation.
- **Neon Postgres** — two tables (`sections`, `tasks`); see
  [`lib/schema.sql`](lib/schema.sql) for the full shape and reasoning.
- **Due dates** (`lib/due-date.ts`, `DueDatePicker.tsx`) — replaced the
  original fixed relative-urgency buckets (Today / 2–3 days / End of this
  week / This month / Custom). A one-click "Today" chip plus a native
  `<input type="date">` (a real calendar picker on every modern
  browser/OS — no date-picker library needed) either on task creation or,
  on an existing task, behind the same pencil-edit toggle the name uses.
  `tasks.due_date` is nullable — no date at all is a normal, common state
  (a someday/backlog item), not a placeholder. The "for today" box is
  every not-done task with `due_date <= today`: nothing to update
  overnight, a task just keeps showing up — with its real, now-past due
  date still visible — until it's done or its date is moved. Comparisons
  use plain string ordering on `"YYYY-MM-DD"` rather than parsing a
  `Date`, since that format sorts lexicographically the same as
  chronologically; this also sidesteps a real bug hit during the
  migration — the `neon()` HTTP client parses a bare `date` column into a
  JS `Date` client-side, which shifts it by the local UTC offset and
  corrupts the calendar day, not just the format, so every query reading
  `due_date` casts it to `text` in SQL instead (see `lib/data.ts`).
- **Calendar sidebar** — reads a Google Calendar private iCal feed
  (`GCAL_ICS_URL`), read-only, refreshed on demand. Recurring events are
  expanded via `lib/gcal.ts`; `next.config.ts` marks `node-ical` as a
  server-external package because Turbopack breaks its Temporal polyfill
  otherwise.
- **Chat** — a Claude tool-use loop (`lib/chat-loop.ts`, Anthropic Messages
  API, `claude-opus-5`, manual loop — not the beta tool runner, this needs
  no more than a single-request loop) with five tools: `list_tasks`
  (surfaces each task's due_date and a computed overdue flag),
  `add_task` (name, list, an optional due_date, an optional
  `duration_minutes`, and an optional `time_of_day` — due_date is left
  unset rather than defaulted to today when the user doesn't imply one;
  someday/backlog items with no firm date are a real, common state, not a
  gap to fill in),
  `list_calendar_events` (existing bookings in a range, for seeing gaps),
  `schedule_task` (books a real Google Calendar event sized off
  `duration_minutes` — the task's own if set, else the model's estimate,
  computed server-side rather than trusting the model's date math — tags
  the task with the resulting `calendar_event_id` so it isn't rebooked,
  and refuses server-side if the slot overlaps an existing event unless
  `force: true`), `mark_task_done`. Replaces the old Slack-routine
  handoff entirely — needs `ANTHROPIC_API_KEY`. `duration_minutes` and
  `time_of_day` (`lib/time-of-day.ts` — "morning"/"afternoon"/"evening",
  or no preference) are also plain fields on every task in the dashboard
  UI itself — visible and editable inline (not just at creation), always
  shown even when unset, saving on blur/click
  (`DurationInput.tsx`/`TimeOfDayPicker.tsx`, used from `QuickAddBox`,
  `TaskAddBox`, `TodayTaskRow`, `ListTaskRow`) — not just chat concepts.
  `schedule_task`'s own tool description and the system prompt both tell
  the model to book within a task's `time_of_day` window when the user
  hasn't given schedule_task an exact time itself, ahead of the general
  planning rules if the two disagree. The system prompt also injects the
  user's free-text planning rules from `/settings` (`lib/preferences.ts`
  — work hours, lunch, deep-work window, block length, buffering, etc.)
  so the model's own time choices follow them; an explicit time the user
  gives directly still wins. Chat is reachable two ways:
  - `app/api/chat/route.ts` — the interactive box on the dashboard.
  - `app/api/cron/morning-schedule/route.ts` — a Vercel Cron hit at 08:15
    UTC daily (09:15 BST — see that file's own comment for the DST
    caveat), same loop, started by a fixed "book today's outstanding
    tasks" prompt instead of the user typing one. Needs `CRON_SECRET`,
    which Vercel sends back as the request's bearer token automatically
    once the var exists; the route 401s without a match, including on
    Vercel's own request if the var is unset.
- **Google Calendar write access** (`/settings`) — separate OAuth flow
  from the read-only sidebar; see `lib/google-auth.ts` /
  `lib/google-calendar.ts`. Needs `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` and a one-time Connect click.
- **Password gate** — the whole site sits behind one shared password
  (`SITE_PASSWORD`), enforced in `proxy.ts` (Next 16 renamed
  `middleware.ts` to this). Added once the chat started spending API
  budget and writing to the calendar. `/api/cron/*` is carved out of the
  gate's matcher — Vercel's cron request carries no session cookie, only
  its own `CRON_SECRET` bearer token, which that route checks itself.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL — see .env.example
                              # for the rest (all optional)
npm run db:migrate           # creates the tables (safe to re-run)
npm run db:seed              # seeds the same starter content as the design mockup
npm run dev                  # http://localhost:3000
```

`DATABASE_URL` is the only *required* environment variable — get it from
your Neon project dashboard → **Connection Details** → the pooled
connection string (ends in `?sslmode=require`). Everything else
(`GCAL_ICS_URL`, `SITE_PASSWORD`, `GOOGLE_CLIENT_ID`/`SECRET`,
`ANTHROPIC_API_KEY`) is optional — each feature just degrades to an
inline "not set up" state when its vars are unset, except `SITE_PASSWORD`,
which no-ops the whole gate (open site) rather than degrading a feature.

If `DATABASE_URL` isn't set (or the tables haven't been migrated yet), the
app shows a plain error card explaining that, rather than silently falling
back to fake data.

## Deployed

Live at **https://www.manualbrain.xyz** (aliased to the Vercel default
`manual-brain-iota.vercel.app`), on Vercel project `manual-brain` (team
`wills-projects-92f15313`), backed by a Neon Postgres database
(`neon-purple-dog`) provisioned through Vercel's Neon marketplace
integration and connected to the project automatically. All env vars are
set as Production + Development — Preview never got them due to a
`vercel env add` CLI bug on this project (repeats its own suggested fix
command and still fails); harmless for now since nothing here depends on
Preview deploys.

Google OAuth's authorized redirect URI is pinned to
`https://www.manualbrain.xyz/api/auth/google/callback` (+
`http://localhost:3000/...` for local dev) in the Google Cloud Console
credential — changing the canonical domain means updating that too.

To redeploy after local changes: `vercel deploy --prod`. To change an env
var: `vercel env add <NAME> production --value "<value>" --yes` (repeat
per environment), or the Vercel dashboard → Project → Settings →
Environment Variables.

## Project structure

```
app/
  page.tsx              Server Component — loads initial state, renders Dashboard
  layout.tsx            Manrope font, page metadata
  globals.css           base styles + hover-state classes
  login/page.tsx         password gate form
  settings/page.tsx       Google Calendar connect/status + planning rules
  chat/page.tsx           chat page shell (renders ChatPanel)
  api/
    state/route.ts      GET  — full sections+tasks read
    sections/route.ts   POST — create a list
    tasks/route.ts      POST — create a task
    tasks/[id]/route.ts PATCH (edit name / due date / done / duration / time of day) and DELETE
    tasks/[id]/book/route.ts  POST — BookButton's one-task shortcut into
                               the chat loop
    preferences/route.ts GET (added for the iOS app) / POST — planning rules
    calendar/route.ts    GET — read-only calendar feed as JSON (added for
                               the iOS app; mirrors app/page.tsx's server-side read)
    settings/route.ts    GET — Google Calendar + planning-rules status as
                               JSON (added for the iOS app; mirrors app/settings/page.tsx)
    chat/route.ts        POST — the interactive chat, wraps lib/chat-loop.ts
    cron/morning-schedule/route.ts  GET — daily 08:15 UTC auto-schedule run
    auth/login|logout/route.ts       password gate session cookie
    auth/google/start|callback/route.ts  Google Calendar OAuth handshake
components/
  Dashboard.tsx          all state + interaction logic
  TodayTaskRow.tsx        row used in the home "for today" block
  ListTaskRow.tsx         row used inside a list view
  DueDatePicker.tsx       "Today" chip + native date input; plain text
                           until the row's pencil toggles edit mode
  DurationInput.tsx       same plain-text/pencil-edit pattern, for minutes
  TimeOfDayPicker.tsx     same pattern again, for the morning/afternoon/
                           evening booking-preference chips
  BookButton.tsx          "BOOKED" tag, or a "BOOK" button that hands the
                           task to the chat loop to book on its own
  QuickAddBox.tsx         home's quick-add (adds to a chosen list)
  TaskAddBox.tsx          list view's add-task box
  DonePanel.tsx           collapsible done list with undo
  CalendarPanel.tsx       live, read-only Google Calendar sidebar
  ChatPanel.tsx           chat UI — client-side message history + send loop
  PreferencesForm.tsx     planning-rules textarea, save-on-blur, reset-to-default
lib/
  db.ts        lazy Neon client (reads DATABASE_URL)
  data.ts      shared "load everything" query, used by the page and /api/state
  gcal.ts      fetches + parses GCAL_ICS_URL, expands recurring events (read-only)
  google-auth.ts      Google OAuth token exchange/refresh/storage (write access)
  google-calendar.ts  createCalendarEvent() + listCalendarEvents() — the
                       chat's booking + conflict-check tools
  chat-tools.ts        tool definitions + execution for the chat loop
  chat-loop.ts          the tool-use loop itself, shared by the
                         interactive chat and the morning cron
  preferences.ts        planning-rules get/save, with a hardcoded default
  auth.ts       SITE_PASSWORD session cookie logic
  due-date.ts  "YYYY-MM-DD" helpers — dateKey, isOverdue, isDueOrOverdue,
               formatDueDate; see the Stack section above for why
  time-of-day.ts  TimeOfDay type + isTimeOfDay validator + display labels
                  for the morning/afternoon/evening booking preference
  types.ts     shared Section/Task shapes
  schema.sql   table definitions
proxy.ts       site-wide password gate (Next 16's replacement for middleware.ts)
scripts/
  migrate.mjs  applies schema.sql
  seed.mjs     seeds starter content (idempotent)
ios/           native SwiftUI client — see ios/README.md
```

## iOS app

`ios/` is a native SwiftUI implementation of the `ui_kits/ios/` click-through
prototype from this project's own [design system](https://github.com/willhall020-lgtm/manual-brain)
export — five tabs (chat, today, tomorrow, lists, settings) talking to the
same API routes above over the same session cookie the web dashboard uses.
See [`ios/README.md`](ios/README.md) for setup (it's an
[XcodeGen](https://github.com/yonaskolb/XcodeGen) spec, not a checked-in
`.xcodeproj`) and a full account of what was carried over from the
prototype as-is versus re-grounded in this repo's current schema (real due
dates didn't exist yet when that kit was designed).

## Deliberately out of scope (V1, per spec.md)

- Email integration.
- Per-user accounts — `SITE_PASSWORD` is one shared password for the whole
  site, not a real auth system.

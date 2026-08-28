# Manual Brain

A low-friction, high-contrast task tracker built for an ADHD brain: three
default lists, a fixed set of relative urgency labels (no calendar-date
picking), a "for today" view so you never have to see the whole backlog at
once, a live read-only Google Calendar sidebar, and an in-site chat that
does what a Slack routine used to — reads your tasks, decides what to book
today, and puts it on the calendar itself.

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
- **Calendar sidebar** — reads a Google Calendar private iCal feed
  (`GCAL_ICS_URL`), read-only, refreshed on demand. Recurring events are
  expanded via `lib/gcal.ts`; `next.config.ts` marks `node-ical` as a
  server-external package because Turbopack breaks its Temporal polyfill
  otherwise.
- **Chat** — a Claude tool-use loop (`lib/chat-loop.ts`, Anthropic Messages
  API, `claude-opus-5`, manual loop — not the beta tool runner, this needs
  no more than a single-request loop) with four tools: `list_tasks`,
  `add_task`, `schedule_task` (books a real Google Calendar event, and
  tags the task with the resulting `calendar_event_id` so it isn't
  rebooked), `mark_task_done`. Replaces the old Slack-routine handoff
  entirely — needs `ANTHROPIC_API_KEY`. Reachable two ways:
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
  layout.tsx            Archivo font, page metadata
  globals.css           base styles + hover-state classes
  login/page.tsx         password gate form
  settings/page.tsx       Google Calendar connect/status
  chat/page.tsx           chat page shell (renders ChatPanel)
  api/
    state/route.ts      GET  — full sections+tasks read
    sections/route.ts   POST — create a list
    tasks/route.ts      POST — create a task
    tasks/[id]/route.ts PATCH (edit name / urgency / done) and DELETE
    chat/route.ts        POST — the interactive chat, wraps lib/chat-loop.ts
    cron/morning-schedule/route.ts  GET — daily 08:15 UTC auto-schedule run
    auth/login|logout/route.ts       password gate session cookie
    auth/google/start|callback/route.ts  Google Calendar OAuth handshake
components/
  Dashboard.tsx          all state + interaction logic
  TodayTaskRow.tsx        row used in the home "for today" block
  ListTaskRow.tsx         row used inside a list view (urgency pill/dot + menu)
  QuickAddBox.tsx         home's quick-add (adds to a chosen list)
  TaskAddBox.tsx          list view's add-task box
  DonePanel.tsx           collapsible done list with undo
  CalendarPanel.tsx       live, read-only Google Calendar sidebar
  ChatPanel.tsx           chat UI — client-side message history + send loop
  UrgencyChipRow.tsx      shared urgency picker used by both add boxes
lib/
  db.ts        lazy Neon client (reads DATABASE_URL)
  data.ts      shared "load everything" query, used by the page and /api/state
  gcal.ts      fetches + parses GCAL_ICS_URL, expands recurring events (read-only)
  google-auth.ts      Google OAuth token exchange/refresh/storage (write access)
  google-calendar.ts  createCalendarEvent() — the chat's booking tool
  chat-tools.ts        tool definitions + execution for the chat loop
  chat-loop.ts          the tool-use loop itself, shared by the
                         interactive chat and the morning cron
  auth.ts       SITE_PASSWORD session cookie logic
  urgency.ts   the fixed set of urgency labels + colors
  types.ts     shared Section/Task shapes
  schema.sql   table definitions
proxy.ts       site-wide password gate (Next 16's replacement for middleware.ts)
scripts/
  migrate.mjs  applies schema.sql
  seed.mjs     seeds starter content (idempotent)
```

## Deliberately out of scope (V1, per spec.md)

- Email integration.
- Deleting a list (matches the original design — you can only add lists).
- Per-user accounts — `SITE_PASSWORD` is one shared password for the whole
  site, not a real auth system.

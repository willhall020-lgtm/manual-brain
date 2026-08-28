# Manual Brain

A low-friction, high-contrast task tracker built for an ADHD brain: three
default lists, a fixed set of relative urgency labels (no calendar-date
picking), a "for today" view so you never have to see the whole backlog at
once, a live read-only Google Calendar sidebar, and a one-click sync that
pushes today's tasks to a Slack channel a Claude routine watches to book
them onto the calendar.

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
- **Slack sync** — a "Send today → Slack" button
  (`app/api/slack/sync/route.ts`) posts today's `Today`-urgency tasks to a
  Slack Incoming Webhook (`SLACK_WEBHOOK_URL`) for the Claude routine in
  that channel to pick up and book onto the calendar. The routine itself
  lives outside this repo.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL (and optionally
                              # GCAL_ICS_URL / SLACK_WEBHOOK_URL)
npm run db:migrate           # creates the tables (safe to re-run)
npm run db:seed              # seeds the same starter content as the design mockup
npm run dev                  # http://localhost:3000
```

`DATABASE_URL` is the only *required* environment variable — get it from
your Neon project dashboard → **Connection Details** → the pooled
connection string (ends in `?sslmode=require`). `GCAL_ICS_URL` and
`SLACK_WEBHOOK_URL` are optional; each feature just degrades to an inline
"not connected" message when its var is unset.

If `DATABASE_URL` isn't set (or the tables haven't been migrated yet), the
app shows a plain error card explaining that, rather than silently falling
back to fake data.

## Deployed

Live at **https://manual-brain-iota.vercel.app**, on Vercel project
`manual-brain` (team `wills-projects-92f15313`), backed by a Neon Postgres
database (`neon-purple-dog`) provisioned through Vercel's Neon marketplace
integration and connected to the project automatically. `DATABASE_URL`,
`GCAL_ICS_URL`, and `SLACK_WEBHOOK_URL` are set as Production +
Development environment variables — Preview never got them due to a
`vercel env add` CLI bug on this project (repeats its own suggested fix
command and still fails); harmless for now since nothing here depends on
Preview deploys.

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
  api/
    state/route.ts      GET  — full sections+tasks read
    sections/route.ts   POST — create a list
    tasks/route.ts      POST — create a task
    tasks/[id]/route.ts PATCH (edit name / urgency / done) and DELETE
    slack/sync/route.ts POST — push today's tasks to the Slack webhook
components/
  Dashboard.tsx          all state + interaction logic
  TodayTaskRow.tsx        row used in the home "for today" block
  ListTaskRow.tsx         row used inside a list view (urgency pill/dot + menu)
  QuickAddBox.tsx         home's quick-add (adds to a chosen list)
  TaskAddBox.tsx          list view's add-task box
  DonePanel.tsx           collapsible done list with undo
  CalendarPanel.tsx       live, read-only Google Calendar sidebar
  UrgencyChipRow.tsx      shared urgency picker used by both add boxes
lib/
  db.ts        lazy Neon client (reads DATABASE_URL)
  data.ts      shared "load everything" query, used by the page and /api/state
  gcal.ts      fetches + parses GCAL_ICS_URL, expands recurring events
  urgency.ts   the fixed set of urgency labels + colors
  types.ts     shared Section/Task shapes
  schema.sql   table definitions
scripts/
  migrate.mjs  applies schema.sql
  seed.mjs     seeds starter content (idempotent)
```

## Deliberately out of scope (V1, per spec.md)

- Moving the Slack channel/routine into the site; in-app chat.
- Email integration.
- Deleting a list (matches the original design — you can only add lists).
- Writing to Google Calendar from the site (the panel is read-only; the
  Slack routine is what books events).

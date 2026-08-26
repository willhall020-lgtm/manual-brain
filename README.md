# Manual Brain

A low-friction, high-contrast task tracker built for an ADHD brain: three
default lists, a fixed set of relative urgency labels (no calendar-date
picking), a "for today" view so you never have to see the whole backlog at
once, and a read-only Google Calendar preview alongside it.

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
- **Calendar sidebar** is a static, read-only preview (matches the design's
  MVP scope) — not a live Google Calendar integration yet.

## Local setup

```bash
npm install
cp .env.example .env.local   # then paste your Neon connection string in
npm run db:migrate           # creates the tables (safe to re-run)
npm run db:seed              # seeds the same starter content as the design mockup
npm run dev                  # http://localhost:3000
```

`DATABASE_URL` is the only required environment variable — get it from
your Neon project dashboard → **Connection Details** → the pooled
connection string (ends in `?sslmode=require`).

If `DATABASE_URL` isn't set (or the tables haven't been migrated yet), the
app shows a plain error card explaining that, rather than silently falling
back to fake data.

## Deploying to Vercel

1. This repo is already on GitHub at `willhall020-lgtm/manual-brain`.
2. In Vercel: **Add New Project** → import that repo. Vercel auto-detects
   Next.js, no build config needed.
3. Under **Settings → Environment Variables**, add `DATABASE_URL` with your
   Neon connection string (Production, and Preview/Development if you want
   those to hit the same database).
4. Before (or right after) the first deploy, run the migration once against
   that same database — from your machine, with `.env.local` pointed at the
   same `DATABASE_URL`: `npm run db:migrate && npm run db:seed`.
5. Deploy.

> **Note:** this was built in a sandboxed environment with no Vercel
> CLI/account access, so it has **not** been deployed anywhere yet — steps
> 2–5 above are still to do on your end.

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
components/
  Dashboard.tsx          all state + interaction logic
  TodayTaskRow.tsx        row used in the home "for today" block
  ListTaskRow.tsx         row used inside a list view (urgency pill/dot + menu)
  QuickAddBox.tsx         home's quick-add (adds to a chosen list)
  TaskAddBox.tsx          list view's add-task box
  DonePanel.tsx           collapsible done list with undo
  CalendarPanel.tsx       static read-only calendar preview
  UrgencyChipRow.tsx      shared urgency picker used by both add boxes
lib/
  db.ts        lazy Neon client (reads DATABASE_URL)
  data.ts      shared "load everything" query, used by the page and /api/state
  urgency.ts   the fixed set of urgency labels + colors
  types.ts     shared Section/Task shapes
  schema.sql   table definitions
scripts/
  migrate.mjs  applies schema.sql
  seed.mjs     seeds starter content (idempotent)
```

## Deliberately out of scope (per the design brief)

- Slack integration, in-app chat, email integration.
- A live Google Calendar connection (the sidebar is a static preview).
- Deleting a list (matches the original design — you can only add lists).

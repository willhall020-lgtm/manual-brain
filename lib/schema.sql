-- Manual Brain schema (Neon Postgres)
--
-- Kept deliberately small for the MVP scope: two tables instead of the
-- three implied by the original prototype's in-memory shape (sections /
-- tasks / a separate "done" list) — a nullable `done_at` on `tasks` plays
-- the same role as the prototype's separate done array (filter on it for
-- the Done panel, clear it to undo) while keeping the task's section
-- association for free, which is exactly what "undo" needs.

CREATE TABLE IF NOT EXISTS sections (
  id text PRIMARY KEY,
  name text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  section_id text NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  urgency text NOT NULL DEFAULT 'Today',
  custom_label text,
  position integer NOT NULL,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Set by the chat's schedule_task tool once a task is booked onto Google
-- Calendar. Lets both the chat and the morning cron (see
-- app/api/cron/morning-schedule) tell an already-booked task apart from
-- one that still needs a slot, so the daily run doesn't rebook the same
-- task every morning. CREATE TABLE above predates this column, hence the
-- separate ALTER — both are safe to re-run.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS calendar_event_id text;

-- Optional, user-set estimate of how long a task takes — surfaced to the
-- chat (list_tasks) so schedule_task can size the calendar event off a
-- real number instead of guessing, when the user bothered to set one.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration_minutes integer;

-- Real due dates replaced the old fixed urgency buckets (Today / 2-3 days /
-- End of this week / This month / Custom) — see lib/due-date.ts. `urgency`
-- and `custom_label` above are kept rather than dropped (just unused by the
-- app now) so no data is lost; nothing reads them any more. One-time
-- backfill maps the one bucket with an unambiguous date (Today) across;
-- everything else is genuinely ambiguous (which day in "this month"?) so
-- it's left for the user to set for real rather than guessed at.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date date;
UPDATE tasks SET due_date = CURRENT_DATE WHERE urgency = 'Today' AND due_date IS NULL;

-- Optional, user-set preference for roughly when in the day a task should
-- be booked ('morning' / 'afternoon' / 'evening', or null for no
-- preference) — surfaced to the chat (list_tasks) so schedule_task can
-- pick a slot that matches when the user hasn't given an exact time
-- themselves. See lib/time-of-day.ts.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_of_day text;

-- Optional repeat rule ('daily' / 'weekly' / 'monthly', or null for a
-- one-off task) — only meaningful alongside due_date; see lib/repeat.ts.
-- Completing a repeating task rolls due_date forward instead of setting
-- done_at, so there's no separate history of past occurrences to store.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_frequency text;

CREATE INDEX IF NOT EXISTS tasks_section_id_idx ON tasks (section_id);
CREATE INDEX IF NOT EXISTS tasks_done_at_idx ON tasks (done_at);

-- Free-text planning rules the chat follows when deciding what to book and
-- when (see lib/preferences.ts) — set on /settings, read by
-- lib/chat-loop.ts's system prompt. Single-user app, one row, same
-- 'default'-id pattern as google_auth below. No seed row: lib/preferences.ts
-- falls back to a hardcoded default whenever this table is empty, so the
-- app works before anyone's ever saved a preference.
CREATE TABLE IF NOT EXISTS preferences (
  id text PRIMARY KEY DEFAULT 'default',
  planning_rules text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Single-row table holding the Google OAuth refresh/access token pair for
-- writing to the calendar (booking events). Single-user app — one row,
-- id is always 'default'. Read-only calendar display still uses the iCal
-- feed (GCAL_ICS_URL); this table is only for the write path.
CREATE TABLE IF NOT EXISTS google_auth (
  id text PRIMARY KEY DEFAULT 'default',
  refresh_token text NOT NULL,
  access_token text,
  access_token_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

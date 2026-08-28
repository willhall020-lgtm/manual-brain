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

CREATE INDEX IF NOT EXISTS tasks_section_id_idx ON tasks (section_id);
CREATE INDEX IF NOT EXISTS tasks_done_at_idx ON tasks (done_at);

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

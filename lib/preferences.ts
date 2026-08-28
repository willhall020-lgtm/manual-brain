import { sql } from "./db";

// Free-text planning rules, edited on /settings, injected into the chat's
// system prompt (lib/chat-loop.ts) so both the interactive chat and the
// morning cron follow them. Deliberately not structured fields — the
// rules mix hard constraints (work hours) with judgment calls ("push
// unfinished work to the evening if I'm going to crash mid-afternoon")
// that read far more naturally as prose the model interprets than as a
// form the code would have to enforce.

export const DEFAULT_PLANNING_RULES = `Work hours: 09:00–18:00
Lunch: 13:00–13:45 — keep clear, or only small admin tasks
Deep work: schedule [deep] tasks before 12:00 where possible
Block length: 30 min minimum, 90 min maximum — split anything longer into multiple blocks
Buffer: 10 min between blocks
Quick wins (under 20 min): cluster into one "admin sweep" block, or use them to fill small gaps between other things
Protect existing calendar events — never schedule over them
Energy dip: I tend to crash 15:00–18:00, then work well again after 19:00 — if something outstanding doesn't fit earlier in the day, prefer pushing it to the evening over the crash window`;

export async function getPlanningRules(): Promise<string> {
  const db = sql();
  const rows = (await db`
    SELECT planning_rules FROM preferences WHERE id = 'default'
  `) as { planning_rules: string }[];
  return rows[0]?.planning_rules ?? DEFAULT_PLANNING_RULES;
}

// Saving an empty/whitespace-only value resets to the default rather than
// storing an empty string — same "unset just falls back" pattern as the
// rest of this app's optional settings.
export async function savePlanningRules(text: string): Promise<string> {
  const trimmed = text.trim();
  const db = sql();
  if (!trimmed) {
    await db`DELETE FROM preferences WHERE id = 'default'`;
    return DEFAULT_PLANNING_RULES;
  }
  await db`
    INSERT INTO preferences (id, planning_rules, updated_at)
    VALUES ('default', ${trimmed}, now())
    ON CONFLICT (id) DO UPDATE SET planning_rules = EXCLUDED.planning_rules, updated_at = now()
  `;
  return trimmed;
}

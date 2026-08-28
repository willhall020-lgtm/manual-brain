// Optional per-task repeat rule. Only meaningful alongside a due date — the
// UI only offers it once a date is set (see DueDatePicker), and the API
// enforces the same: clearing a task's due date clears its repeat rule too.
//
// Completing a repeating task doesn't move it into the Done panel like a
// one-off task — it rolls due_date forward to the next occurrence and
// leaves done_at null instead (see advanceDueDate below, and the `done`
// handling in app/api/tasks/[id]/route.ts). That keeps the whole feature to
// one row per task, no history table, matching this app's existing "small
// schema" bias (see lib/schema.sql's header comment).

export type RepeatFrequency = "daily" | "weekly" | "monthly";

const VALUES: readonly RepeatFrequency[] = ["daily", "weekly", "monthly"];

export function isRepeatFrequency(v: unknown): v is RepeatFrequency {
  return typeof v === "string" && (VALUES as readonly string[]).includes(v);
}

export const REPEAT_FREQUENCY_OPTIONS: readonly RepeatFrequency[] = VALUES;

export const REPEAT_FREQUENCY_LABELS: Record<RepeatFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function daysInMonth(year: number, monthIndex: number): number {
  // Day 0 of the *next* month is the last day of this one.
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function toDueDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next occurrence of a "YYYY-MM-DD" due date for the given frequency.
 * Monthly clamps to the target month's last day rather than rolling over
 * into the month after (31 Jan -> 28/29 Feb, not 3 Mar) — that's what
 * "same day next month" means for the months that don't have a 31st.
 * All math runs in UTC so it can't drift a day depending on runtime
 * timezone — same reasoning as dateKey in lib/due-date.ts. */
export function advanceDueDate(dueDate: string, frequency: RepeatFrequency): string {
  const [y, m, d] = dueDate.split("-").map(Number);

  if (frequency === "daily") {
    return toDueDateString(new Date(Date.UTC(y, m - 1, d + 1)));
  }
  if (frequency === "weekly") {
    return toDueDateString(new Date(Date.UTC(y, m - 1, d + 7)));
  }

  // monthly
  const targetIndex = m - 1 + 1; // 0-based month index, one past the current
  const targetYear = y + Math.floor(targetIndex / 12);
  const targetMonth = ((targetIndex % 12) + 12) % 12;
  const clampedDay = Math.min(d, daysInMonth(targetYear, targetMonth));
  return toDueDateString(new Date(Date.UTC(targetYear, targetMonth, clampedDay)));
}

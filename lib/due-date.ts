// Real due dates — replaces the old fixed relative-urgency buckets (Today /
// 2–3 days / End of this week / This month / Custom). "Today" survives as a
// one-click quick-pick; everything else is now an actual calendar date
// rather than a fuzzy bucket.
//
// Dates are plain "YYYY-MM-DD" strings throughout (DB column is `date`, no
// time component) — comparisons use plain string ordering (works because
// that format sorts lexicographically the same as chronologically) rather
// than parsing into a Date, which sidesteps timezone drift entirely for
// the due/overdue logic itself.

const DUE_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDueDateString(v: unknown): v is string {
  return typeof v === "string" && DUE_DATE_RE.test(v);
}

/** "YYYY-MM-DD" for a Date, using its local (not UTC) calendar fields —
 * matches how Dashboard.tsx already treats its `today` prop elsewhere. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isOverdue(dueDate: string, todayKey: string): boolean {
  return dueDate < todayKey;
}

/** Due today or earlier (and not done) — what populates the "for today" box. */
export function isDueOrOverdue(dueDate: string | null, todayKey: string): boolean {
  return dueDate !== null && dueDate <= todayKey;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "3 Sep" — reads the string's own digits directly rather than going
 * through a Date, so it can't drift a day depending on runtime timezone. */
export function formatDueDate(dueDate: string): string {
  const [, m, d] = dueDate.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

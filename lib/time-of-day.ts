// Optional per-task preference for roughly when in the day it should be
// booked — a hint for the chat's schedule_task tool when the user hasn't
// given an exact time themselves, not a hard constraint (schedule_task's
// conflict check is what actually enforces anything).

export type TimeOfDay = "morning" | "afternoon" | "evening";

const VALUES: readonly TimeOfDay[] = ["morning", "afternoon", "evening"];

export function isTimeOfDay(v: unknown): v is TimeOfDay {
  return typeof v === "string" && (VALUES as readonly string[]).includes(v);
}

export const TIME_OF_DAY_OPTIONS: readonly TimeOfDay[] = VALUES;

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

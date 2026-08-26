// The fixed set of relative urgency labels — deliberately not calendar
// dates, per the design brief ("Manual Brain" is built to stay low-friction
// for an ADHD brain: relative labels are quicker to scan and file than
// specific dates).
export type UrgencyKey =
  | "Today"
  | "2–3 days"
  | "End of this week"
  | "This month"
  | "Custom";

export interface UrgencyMeta {
  k: UrgencyKey;
  bg: string;
  fg: string;
  bd: string;
}

export const URGENCY: UrgencyMeta[] = [
  { k: "Today", bg: "#2B34EE", fg: "#FFFFFF", bd: "1px solid #2B34EE" },
  { k: "2–3 days", bg: "#D6EC3C", fg: "#14140F", bd: "1px solid #C6DC2C" },
  {
    k: "End of this week",
    bg: "#E3E5FD",
    fg: "#2B34EE",
    bd: "1px solid #D2D6FB",
  },
  { k: "This month", bg: "#EDEDE9", fg: "#6E6E67", bd: "1px solid #E2E2DD" },
  { k: "Custom", bg: "#FFFFFF", fg: "#14140F", bd: "1px dashed #A9A99F" },
];

export const URGENCY_KEYS = URGENCY.map((u) => u.k);

export function isUrgencyKey(v: unknown): v is UrgencyKey {
  return typeof v === "string" && (URGENCY_KEYS as string[]).includes(v);
}

export function urgencyMeta(k: string): UrgencyMeta {
  return URGENCY.find((u) => u.k === k) ?? URGENCY[0];
}

export function urgencyLabel(urgency: string, customLabel?: string | null) {
  return urgency === "Custom" ? customLabel || "Custom" : urgency;
}

export const SOON_KEYS: UrgencyKey[] = ["2–3 days", "End of this week"];

import type { UrgencyKey } from "../tasks/UrgencyPill";

export interface MobileTaskRowProps {
  name: string;
  /** Lowercase list name, stacked under the title instead of beside it. */
  sectionName?: string;
  /** Omit inside the today block; show inside a list view. */
  urgency?: UrgencyKey;
  customLabel?: string | null;
  /** "pill" (default) or the compact "dot" — driven by the urgency-labels setting. */
  urgencyDisplay?: "pill" | "dot";
  /** Short due date, e.g. "31 aug". */
  due?: string | null;
  /** Renders the due date red and bold. */
  overdue?: boolean;
  /** Estimated minutes. */
  minutes?: number | null;
  /** Time of day: "morning" | "afternoon" | "evening" | "any time". */
  when?: string | null;
  /** "never" | "daily" | "weekly" | "monthly". */
  repeat?: string | null;
  /** null hides the book button entirely; true/false shows booked/book. */
  booked?: boolean | null;
  /** "today" = borderless on lime; "list" = bordered on grey. */
  variant?: "today" | "list";
  onDone?: () => void;
  onPressUrgency?: () => void;
  onPress?: () => void;
  onBook?: () => void;
}
export declare function MobileTaskRow(props: MobileTaskRowProps): JSX.Element;

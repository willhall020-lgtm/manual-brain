export declare const URGENCY: { k: UrgencyKey; bg: string; fg: string; bd: string }[];
export declare const SOON_KEYS: UrgencyKey[];
export declare function urgencyMeta(k: string): { k: UrgencyKey; bg: string; fg: string; bd: string };
export declare function urgencyLabel(urgency: string, customLabel?: string | null): string;

export type UrgencyKey = "Today" | "2–3 days" | "End of this week" | "This month" | "Custom";

export interface UrgencyPillProps {
  /** One of the five fixed relative labels. */
  urgency?: UrgencyKey;
  /** Shown instead of "Custom" when urgency is "Custom". */
  customLabel?: string | null;
  /** "pill" shows the label; "dot" collapses to a 13px colour dot. */
  display?: "pill" | "dot";
  /** Required on touch surfaces — puts the pill (or the 13px dot) inside a 44px target. */
  hit?: boolean;
  onClick?: () => void;
  title?: string;
}

export declare function UrgencyPill(props: UrgencyPillProps): JSX.Element;

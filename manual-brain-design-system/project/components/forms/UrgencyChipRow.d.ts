import type { UrgencyKey } from "../tasks/UrgencyPill";
export interface UrgencyChipRowProps {
  value?: UrgencyKey;
  /** "touch" grows each chip to a 44px-tall target for mobile screens. */
  size?: "md" | "touch";
  onChange?: (k: UrgencyKey) => void;
}
export declare function UrgencyChipRow(props: UrgencyChipRowProps): JSX.Element;

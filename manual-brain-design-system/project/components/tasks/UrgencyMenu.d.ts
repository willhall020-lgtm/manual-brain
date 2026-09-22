import type { UrgencyKey } from "./UrgencyPill";
export interface UrgencyMenuProps {
  onPick?: (k: UrgencyKey) => void;
  /** Which edge the menu is pinned to inside its relative parent. */
  align?: "left" | "right";
}
export declare function UrgencyMenu(props: UrgencyMenuProps): JSX.Element;

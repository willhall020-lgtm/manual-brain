import type { UrgencyKey } from "../tasks/UrgencyPill";
export interface UrgencySheetProps {
  open?: boolean;
  /** Currently selected label — gets a grey fill and a blue tick. */
  value?: UrgencyKey;
  onClose?: () => void;
  onPick?: (k: UrgencyKey) => void;
}
export declare function UrgencySheet(props: UrgencySheetProps): JSX.Element;

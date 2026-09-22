import type { KeyboardEvent } from "react";
import type { UrgencyKey } from "../tasks/UrgencyPill";

/**
 * Home-screen quick add: one input, a list picker, an urgency picker.
 * @startingPoint section="Forms" subtitle="Quick-add box, open state" viewport="700x330"
 */
export interface QuickAddBoxProps {
  open?: boolean;
  text?: string;
  urgency?: UrgencyKey;
  custom?: string;
  sections?: { id: string; name: string }[];
  selectedSectionId?: string;
  onOpen?: () => void;
  onCancel?: () => void;
  onTextChange?: (v: string) => void;
  onCustomChange?: (v: string) => void;
  onUrgencyChange?: (k: UrgencyKey) => void;
  onSectionPick?: (id: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAdd?: () => void;
}
export declare function QuickAddBox(props: QuickAddBoxProps): JSX.Element;

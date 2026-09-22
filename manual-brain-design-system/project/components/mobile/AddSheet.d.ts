import type { UrgencyKey } from "../tasks/UrgencyPill";

export declare const DURATIONS: number[];
export declare const WHENS: string[];
export declare const REPEATS: string[];

/**
 * The phone's add-a-task sheet: title, list, urgency, due date, duration,
 * time of day, repeat.
 */
export interface AddSheetProps {
  open?: boolean;
  text?: string;
  urgency?: UrgencyKey;
  custom?: string;
  /** ISO date string from the native date field. */
  due?: string;
  minutes?: number | null;
  when?: string;
  repeat?: string;
  sections?: { id: string; name: string }[];
  selectedSectionId?: string;
  onClose?: () => void;
  onTextChange?: (v: string) => void;
  onCustomChange?: (v: string) => void;
  onUrgencyChange?: (k: UrgencyKey) => void;
  onSectionPick?: (id: string) => void;
  onDueChange?: (v: string) => void;
  onMinutesChange?: (v: number | null) => void;
  onWhenChange?: (v: string) => void;
  onRepeatChange?: (v: string) => void;
  onAdd?: () => void;
}
export declare function AddSheet(props: AddSheetProps): JSX.Element;

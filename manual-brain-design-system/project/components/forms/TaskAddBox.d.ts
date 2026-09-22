import type { KeyboardEvent } from "react";
import type { UrgencyKey } from "../tasks/UrgencyPill";
export interface TaskAddBoxProps {
  open?: boolean;
  text?: string;
  urgency?: UrgencyKey;
  custom?: string;
  onOpen?: () => void;
  onCancel?: () => void;
  onTextChange?: (v: string) => void;
  onCustomChange?: (v: string) => void;
  onUrgencyChange?: (k: UrgencyKey) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAdd?: () => void;
}
export declare function TaskAddBox(props: TaskAddBoxProps): JSX.Element;

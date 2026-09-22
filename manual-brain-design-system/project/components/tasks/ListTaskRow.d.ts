import type { KeyboardEvent } from "react";
import type { UrgencyKey } from "./UrgencyPill";

/**
 * A task row inside a list view — bordered, with a clickable urgency pill.
 * @startingPoint section="Tasks" subtitle="List row with urgency pill and menu" viewport="700x150"
 */
export interface ListTaskRowProps {
  name: string;
  urgency?: UrgencyKey;
  customLabel?: string | null;
  /** "pill" (default) or the compact "dot". */
  urgencyDisplay?: "pill" | "dot";
  editing?: boolean;
  editVal?: string;
  menuOpen?: boolean;
  onDone?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onEditChange?: (v: string) => void;
  onEditKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur?: () => void;
  onToggleMenu?: () => void;
  onPickUrgency?: (k: UrgencyKey) => void;
}
export declare function ListTaskRow(props: ListTaskRowProps): JSX.Element;

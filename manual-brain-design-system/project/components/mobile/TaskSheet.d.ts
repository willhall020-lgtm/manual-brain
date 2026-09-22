import type { UrgencyKey } from "../tasks/UrgencyPill";

export interface TaskDraft {
  name?: string;
  sectionId?: string;
  urgency?: UrgencyKey;
  customLabel?: string | null;
  /** ISO date for the native date field, e.g. "2026-09-12". */
  dueISO?: string;
  minutes?: number | null;
  when?: string;
  repeat?: string;
}

/**
 * Tap a task row to open this — the phone's edit surface, since mobile rows
 * carry no inline edit glyph.
 */
export interface TaskSheetProps {
  open?: boolean;
  /** The task being edited. null renders nothing. */
  task?: TaskDraft | null;
  sections?: { id: string; name: string }[];
  onClose?: () => void;
  /** Called with a partial patch on every field change. */
  onChange?: (patch: TaskDraft) => void;
  onSave?: () => void;
  onDelete?: () => void;
  onDone?: () => void;
}
export declare function TaskSheet(props: TaskSheetProps): JSX.Element | null;

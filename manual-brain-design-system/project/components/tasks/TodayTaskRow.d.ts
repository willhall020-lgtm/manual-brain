import type { KeyboardEvent } from "react";

/**
 * A task row inside the lime "for today" block.
 * @startingPoint section="Tasks" subtitle="Today row with list tag and inline edit" viewport="700x150"
 */
export interface TodayTaskRowProps {
  name: string;
  /** Name of the list the task lives in — rendered as the uppercase grey tag. */
  sectionName: string;
  editing?: boolean;
  editVal?: string;
  onDone?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onEditChange?: (v: string) => void;
  onEditKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur?: () => void;
}
export declare function TodayTaskRow(props: TodayTaskRowProps): JSX.Element;

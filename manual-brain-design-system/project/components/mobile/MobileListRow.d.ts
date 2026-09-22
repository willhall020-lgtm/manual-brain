/**
 * A task list as a full-width row on the phone's lists tab.
 */
export interface MobileListRowProps {
  name: string;
  taskCount?: number;
  /** Lime "N due" pill — tasks with a due date at or before today. */
  dueCount?: number;
  /** Lime "N today" pill. Prefer dueCount when the list has real dates. */
  todayCount?: number;
  /** Blue-tint "N soon" pill. */
  soonCount?: number;
  onClick?: () => void;
}
export declare function MobileListRow(props: MobileListRowProps): JSX.Element;

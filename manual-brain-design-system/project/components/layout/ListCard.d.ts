/**
 * A task list as a card on the home screen.
 * @startingPoint section="Layout" subtitle="List card with today / soon counts" viewport="700x160"
 */
export interface ListCardProps {
  name: string;
  taskCount?: number;
  /** Lime "N due" pill — tasks due at or before today. */
  dueCount?: number;
  /** Shows a lime "N today" pill when > 0. */
  todayCount?: number;
  /** Shows a blue-tint "N soon" pill when > 0. */
  soonCount?: number;
  onClick?: () => void;
}
export declare function ListCard(props: ListCardProps): JSX.Element;

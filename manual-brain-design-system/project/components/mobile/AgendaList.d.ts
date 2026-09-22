import type { CalendarEvent } from "../layout/CalendarPanel";

/**
 * The read-only day agenda as a stacked card — the phone's answer to CalendarPanel.
 */
export interface AgendaListProps {
  /** Events before the NOW rule. */
  before?: CalendarEvent[];
  /** Events after the NOW rule. */
  after?: CalendarEvent[];
  /** Hide the lime NOW rule on any day that isn't today. */
  showNow?: boolean;
  source?: string;
  label?: string;
}
export declare function AgendaList(props: AgendaListProps): JSX.Element;

export interface CalendarEvent {
  /** 24-hour, e.g. "09:30". */
  time: string;
  title: string;
  /** Duration and context, e.g. "1 hr · with Priya, Marcus". */
  meta: string;
  /** Left bar: --mb-blue before now, --mb-blue-soft after, --mb-n-450 for tomorrow. */
  barColor: string;
  /** Greys the whole row — used for tomorrow. */
  dim?: boolean;
}

/**
 * The read-only day agenda docked to the right of every screen.
 * @startingPoint section="Layout" subtitle="Read-only calendar sidebar with NOW line" viewport="360x520"
 */
export interface CalendarPanelProps {
  /** Lowercase day label, e.g. "today · tue 1". */
  todayLabel?: string;
  tomorrowLabel?: string;
  /** Events before the NOW line. */
  before?: CalendarEvent[];
  /** Events after the NOW line. */
  after?: CalendarEvent[];
  tomorrow?: CalendarEvent[];
  source?: string;
}
export declare function CalendarPanel(props: CalendarPanelProps): JSX.Element;

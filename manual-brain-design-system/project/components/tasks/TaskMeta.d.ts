export interface DueLabelProps {
  /** Short date, e.g. "31 aug", or a relative word like "today". */
  due?: string | null;
  /** Renders it red and bold, prefixed "overdue · ". */
  overdue?: boolean;
}
export declare function DueLabel(props: DueLabelProps): JSX.Element | null;

export interface DurationLabelProps {
  /** Estimated minutes; whole hours render as "1 hr". */
  minutes?: number | null;
}
export declare function DurationLabel(props: DurationLabelProps): JSX.Element | null;

export interface WhenLabelProps {
  /** Time of day, e.g. "morning", "afternoon", "any time". */
  when?: string | null;
}
export declare function WhenLabel(props: WhenLabelProps): JSX.Element | null;

export interface RepeatLabelProps {
  /** "never" | "daily" | "weekly" | "monthly". "never" renders nothing. */
  repeat?: string | null;
}
export declare function RepeatLabel(props: RepeatLabelProps): JSX.Element | null;

export interface BookButtonProps {
  /** Booked shows a pale lime pill; unbooked shows the solid ink call to action. */
  booked?: boolean;
  /** Wraps the pill in a 44px-tall pressable box (phone rows). */
  hit?: boolean;
  onClick?: () => void;
}
export declare function BookButton(props: BookButtonProps): JSX.Element;

/**
 * The whole scheduling run in one element, in canonical order:
 * due · duration · when · repeat · book.
 */
export interface TaskMetaProps {
  due?: string | null;
  overdue?: boolean;
  minutes?: number | null;
  when?: string | null;
  repeat?: string | null;
  /** null hides the book button entirely. */
  booked?: boolean | null;
  gap?: number;
  onBook?: () => void;
}
export declare function TaskMeta(props: TaskMetaProps): JSX.Element | null;

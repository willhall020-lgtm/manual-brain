export interface MobileNavBarProps {
  /** Lowercase date eyebrow, e.g. "tuesday 1 september". Hidden when onBack is set. */
  dateLabel?: string;
  /** The lowercase wordmark, or a screen title — rendered as written at 27px/800. */
  title?: string;
  /** Quiet right-aligned count, e.g. "12 tasks · 2 done". */
  meta?: string;
  /** When provided the eyebrow is replaced by a back pill. */
  onBack?: () => void;
  backLabel?: string;
}
export declare function MobileNavBar(props: MobileNavBarProps): JSX.Element;

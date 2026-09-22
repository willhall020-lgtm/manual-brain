export interface PageHeaderProps {
  /** e.g. "tuesday 1 september" — lowercase, wide-tracked. */
  dateLabel: string;
  /** The wordmark, lowercase ("manual brain"). Screen titles render as written. There is no logo mark. */
  title?: string;
  /** Right-aligned count line, e.g. "33 tasks in total · 8 done". */
  meta?: string;
}
export declare function PageHeader(props: PageHeaderProps): JSX.Element;

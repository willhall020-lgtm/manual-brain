export interface ErrorBannerProps {
  /** Plain-spoken and blame-free, e.g. "Couldn't save that task — try again." */
  message: string;
  onDismiss?: () => void;
}
export declare function ErrorBanner(props: ErrorBannerProps): JSX.Element;

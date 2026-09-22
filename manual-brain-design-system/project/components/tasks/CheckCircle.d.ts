export interface CheckCircleProps {
  /** 21 in the today block, 20 inside a list view. */
  size?: number;
  /** Wraps the ring in a 44px pressable box (phone rows) without changing its painted size. */
  hit?: boolean;
  onClick?: () => void;
  title?: string;
}
export declare function CheckCircle(props: CheckCircleProps): JSX.Element;

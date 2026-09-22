export interface ChipProps {
  label: string;
  selected?: boolean;
  /** Selected fill: "ink" (list picker) or "lime". */
  tone?: "ink" | "lime";
  /** "touch" grows padding to a 44px-tall target for mobile screens. */
  size?: "md" | "touch";
  onClick?: () => void;
}
export declare function Chip(props: ChipProps): JSX.Element;

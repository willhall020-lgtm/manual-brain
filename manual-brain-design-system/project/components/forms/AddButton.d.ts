export interface AddButtonProps {
  /** Uppercase, usually with the ↵ hint. */
  label?: string;
  /** True once the input has content — turns the button ink-black. */
  filled?: boolean;
  /** "touch" grows the button to a 44px-tall target for mobile screens. */
  size?: "md" | "touch";
  onClick?: () => void;
}
export declare function AddButton(props: AddButtonProps): JSX.Element;

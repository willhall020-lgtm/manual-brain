import type { ReactNode } from "react";

/**
 * One setting: name, an optional plain-English explanation, and its control.
 */
export interface SettingsRowProps {
  label: string;
  /** Say what the setting does in the product's voice, not spec language. */
  description?: string;
  /** Right-aligned current value, for read-only rows with no control. */
  value?: string;
  /** The control — usually a pair of Chips. */
  children?: ReactNode;
}
export declare function SettingsRow(props: SettingsRowProps): JSX.Element;

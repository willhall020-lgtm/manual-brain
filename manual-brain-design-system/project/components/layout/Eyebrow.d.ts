import type { ReactNode } from "react";
export interface EyebrowProps {
  children?: ReactNode;
  tone?: "muted" | "ink" | "faint";
}
export declare function Eyebrow(props: EyebrowProps): JSX.Element;

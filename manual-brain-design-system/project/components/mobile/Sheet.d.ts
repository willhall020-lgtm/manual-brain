import type { ReactNode } from "react";
export interface SheetProps {
  open?: boolean;
  /** Eyebrow-cased sheet label, e.g. "NEW TASK" or "HOW URGENT?". */
  title?: string;
  onClose?: () => void;
  children?: ReactNode;
  height?: number | string;
}
export declare function Sheet(props: SheetProps): JSX.Element | null;

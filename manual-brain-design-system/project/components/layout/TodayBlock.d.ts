import type { ReactNode } from "react";

/**
 * The lime "for today" block — the loudest element in the product.
 * @startingPoint section="Layout" subtitle="Lime for-today block with rows" viewport="700x260"
 */
export interface TodayBlockProps {
  /** Number of tasks marked Today — rendered at 44px/800. */
  count?: number;
  /** Reassuring one-liner on the right; pass null to hide. */
  note?: string | null;
  /** TodayTaskRow children plus (optionally) a QuickAddBox. */
  children?: ReactNode;
}
export declare function TodayBlock(props: TodayBlockProps): JSX.Element;

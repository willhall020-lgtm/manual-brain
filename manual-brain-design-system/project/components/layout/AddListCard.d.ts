import type { KeyboardEvent } from "react";
export interface AddListCardProps {
  adding?: boolean;
  value?: string;
  onOpen?: () => void;
  onChange?: (v: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onCreate?: () => void;
}
export declare function AddListCard(props: AddListCardProps): JSX.Element;

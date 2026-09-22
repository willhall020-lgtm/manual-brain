import type { ReactNode } from "react";
export interface ChatBubbleProps {
  /** "me" = ink, right-aligned; "brain" = white card, left-aligned. */
  from?: "me" | "brain";
  children?: ReactNode;
  /** Dims the bubble while a reply is in flight. */
  pending?: boolean;
}
export declare function ChatBubble(props: ChatBubbleProps): JSX.Element;

export interface ChatComposerProps {
  value?: string;
  placeholder?: string;
  /** True while a reply is in flight — disables send. */
  busy?: boolean;
  onChange?: (v: string) => void;
  onSend?: () => void;
}
export declare function ChatComposer(props: ChatComposerProps): JSX.Element;

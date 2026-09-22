export interface SuggestionChipsProps {
  /** Short first-person prompts, e.g. "what should I start with?" */
  items?: string[];
  onPick?: (s: string) => void;
}
export declare function SuggestionChips(props: SuggestionChipsProps): JSX.Element;

export interface TabItem {
  id: string;
  /** Lowercase word. Also the accessible name when `glyph` is set. */
  label: string;
  /**
   * Optional unicode glyph shown instead of the label — for a utility tab
   * that shouldn't compete with the day-to-day ones (e.g. "⚙︎" for settings).
   * Always include the variation selector U+FE0E so it renders as monochrome
   * text, never as a colour emoji.
   */
  glyph?: string;
}

export interface TabBarProps {
  /** 2–5 tabs (5 is the ceiling at phone width). Labels are lowercase words, never icons. */
  tabs?: TabItem[];
  active?: string;
  onSelect?: (id: string) => void;
}
export declare function TabBar(props: TabBarProps): JSX.Element;

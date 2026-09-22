export interface IconButtonProps {
  /** A single unicode glyph — Manual Brain has no icon library. ✎ ✕ ↺ → ← + are the whole set. */
  glyph: string;
  title?: string;
  onClick?: () => void;
  /** "danger" turns the glyph red on hover (delete). */
  tone?: "default" | "danger";
  /** 25 on task rows, 24 in the Done panel. */
  size?: number;
  /** Wraps the painted square in a 44px pressable box (phone rows). */
  hit?: boolean;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;

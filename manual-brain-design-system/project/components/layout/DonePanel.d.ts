/**
 * Collapsible done list with undo, pinned to the bottom of every screen.
 * @startingPoint section="Layout" subtitle="Done panel, collapsed and expanded" viewport="700x120"
 */
export interface DonePanelProps {
  items?: { id: string; name: string; sectionName: string }[];
  open?: boolean;
  onToggle?: () => void;
  onUndo?: (id: string) => void;
}
export declare function DonePanel(props: DonePanelProps): JSX.Element;

export interface DoneTaskRowProps {
  name: string;
  sectionName: string;
  onUndo?: () => void;
}
export declare function DoneTaskRow(props: DoneTaskRowProps): JSX.Element;

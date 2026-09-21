"use client";

// Who a task is assigned to — free text (a person's name, or e.g. "Instinct"
// for the chat assistant to pick up during its morning run) rather than a
// fixed list, since this is a single-user app with no real accounts to pick
// from. Same plain-text/editing split as DurationInput: uncontrolled
// (defaultValue, not value/onChange), committing on blur or Enter.

interface Props {
  assignedTo: string | null;
  editing: boolean;
  onCommit: (assignedTo: string | null) => void;
}

export default function AssigneeInput({ assignedTo, editing, onCommit }: Props) {
  function commit(raw: string) {
    const trimmed = raw.trim();
    const next = trimmed || null;
    if (next !== assignedTo) onCommit(next);
  }

  if (!editing) {
    return (
      <span
        style={{
          flex: "none",
          fontSize: 10.5,
          fontWeight: 700,
          color: assignedTo ? "#93938A" : "#C4C4BB",
          letterSpacing: ".02em",
        }}
      >
        {assignedTo ? `@${assignedTo}` : "unassigned"}
      </span>
    );
  }

  return (
    <input
      type="text"
      defaultValue={assignedTo ?? ""}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      title="Who this is assigned to"
      placeholder="assignee"
      style={{
        flex: "none",
        width: 76,
        border: "1px solid #E0E0D9",
        borderRadius: 8,
        padding: "4px 7px",
        fontSize: 11.5,
        fontWeight: 700,
        outline: "none",
        background: "#FBFBF8",
        color: "#7C7C73",
      }}
    />
  );
}

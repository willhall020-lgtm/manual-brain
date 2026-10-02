"use client";

// Who a task is assigned to — free text (a person's name, or e.g. "Instinct"
// for the chat assistant to pick up during its morning run) rather than a
// fixed list, since this is a single-user app with no real accounts to pick
// from. Same plain-text/editing split as DurationInput: uncontrolled
// (defaultValue, not value/onChange), committing on blur or Enter.
//
// Every assignee input (this one and the two add boxes) points at one
// shared <datalist> of names already in use, so a name is rarely typed
// twice — the web's take on the iOS sheets' one-tap assignee chips.

export const KNOWN_ASSIGNEES_LIST_ID = "mb-known-assignees";

/** Everyone tasks are assigned to so far, most-used first — same ordering
 * and case-insensitive dedupe as the iOS app's AppStore.knownAssignees. */
export function knownAssignees(assignees: (string | null)[]): string[] {
  const counts = new Map<string, { name: string; n: number }>();
  for (const raw of assignees) {
    const name = raw?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const entry = counts.get(key);
    if (entry) entry.n += 1;
    else counts.set(key, { name, n: 1 });
  }
  return [...counts.entries()]
    .sort(([ka, a], [kb, b]) => (a.n !== b.n ? b.n - a.n : ka < kb ? -1 : ka > kb ? 1 : 0))
    .map(([, e]) => e.name);
}

export function KnownAssigneesList({ names }: { names: string[] }) {
  return (
    <datalist id={KNOWN_ASSIGNEES_LIST_ID}>
      {names.map((n) => (
        <option key={n} value={n} />
      ))}
    </datalist>
  );
}

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
      list={KNOWN_ASSIGNEES_LIST_ID}
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

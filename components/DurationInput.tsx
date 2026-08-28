"use client";

// Plain, non-interactive text until `editing` is true (driven by the same
// pencil-icon toggle the task name uses) — then a real input, committing
// on blur or Enter like the rest of this app's inline edits. Uncontrolled
// (defaultValue, not value/onChange): the label↔input swap on `editing`
// already forces a fresh mount each time edit mode opens, which is all
// the "reset to the current value" behavior needs — no effect required.

interface Props {
  minutes: number | null;
  editing: boolean;
  onCommit: (minutes: number | null) => void;
}

export default function DurationInput({ minutes, editing, onCommit }: Props) {
  function commit(raw: string) {
    const trimmed = raw.trim();
    const parsed = trimmed ? parseInt(trimmed, 10) : NaN;
    const next = trimmed && parsed > 0 ? parsed : null;
    if (next !== minutes) onCommit(next);
  }

  if (!editing) {
    return (
      <span
        style={{
          flex: "none",
          fontSize: 10.5,
          fontWeight: 700,
          color: minutes != null ? "#93938A" : "#C4C4BB",
          letterSpacing: ".02em",
        }}
      >
        {minutes != null ? `${minutes} min` : "no est."}
      </span>
    );
  }

  return (
    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 3 }}>
      <input
        type="number"
        min={1}
        step={5}
        inputMode="numeric"
        defaultValue={minutes != null ? String(minutes) : ""}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        title="Estimated length, in minutes"
        placeholder="—"
        style={{
          width: 38,
          border: "1px solid #E0E0D9",
          borderRadius: 8,
          padding: "4px 3px",
          fontSize: 11.5,
          fontWeight: 700,
          textAlign: "center",
          outline: "none",
          background: "#FBFBF8",
          color: "#7C7C73",
        }}
      />
      <span style={{ fontSize: 9.5, fontWeight: 700, color: "#B0B0A7", letterSpacing: ".02em" }}>
        MIN
      </span>
    </div>
  );
}

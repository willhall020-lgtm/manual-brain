"use client";

import { useState } from "react";

// Always-visible, always-editable — no click-to-reveal step like the list
// rename does. Local buffer state so typing doesn't round-trip through the
// parent on every keystroke; commits (and only fires onCommit if the value
// actually changed) on blur or Enter.

interface Props {
  minutes: number | null;
  onCommit: (minutes: number | null) => void;
}

export default function DurationInput({ minutes, onCommit }: Props) {
  const [value, setValue] = useState(minutes != null ? String(minutes) : "");

  function commit() {
    const trimmed = value.trim();
    const parsed = trimmed ? parseInt(trimmed, 10) : NaN;
    const next = trimmed && parsed > 0 ? parsed : null;
    setValue(next != null ? String(next) : "");
    if (next !== minutes) onCommit(next);
  }

  return (
    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 3 }}>
      <input
        type="number"
        min={1}
        step={5}
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
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

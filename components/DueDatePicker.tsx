"use client";

import { formatDueDate, isOverdue } from "@/lib/due-date";

// Replaces the old UrgencyChipRow. Two states: `editing` false shows plain
// text (used from the task rows, gated behind the same pencil toggle as
// the name/duration fields); `editing` true shows the actual picker — a
// one-click "Today" chip plus a native <input type="date"> (which is
// exactly "a mini calendar" on every modern browser/OS, no date-picker
// library needed) and a clear button once a date is set. Always in
// "editing" mode when used from the two add boxes, since those are a
// compose form, not a row with its own open/closed toggle.

interface Props {
  value: string | null;
  todayKey: string;
  editing: boolean;
  onChange: (value: string | null) => void;
}

export default function DueDatePicker({ value, todayKey, editing, onChange }: Props) {
  if (!editing) {
    if (!value) {
      return (
        <span style={{ flex: "none", fontSize: 10.5, fontWeight: 700, color: "#C4C4BB", letterSpacing: ".02em" }}>
          no date
        </span>
      );
    }
    const overdue = isOverdue(value, todayKey);
    return (
      <span
        style={{
          flex: "none",
          fontSize: 10.5,
          fontWeight: 700,
          color: overdue ? "#B3261E" : "#93938A",
          letterSpacing: ".02em",
        }}
      >
        {value === todayKey ? "Today" : overdue ? `Overdue · ${formatDueDate(value)}` : formatDueDate(value)}
      </span>
    );
  }

  const isToday = value === todayKey;
  return (
    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 5 }}>
      <button
        type="button"
        onClick={() => onChange(todayKey)}
        className="mb-chip"
        style={{
          background: isToday ? "#14140F" : "#FFFFFF",
          color: isToday ? "#FFFFFF" : "#93938A",
          border: isToday ? "1px solid #14140F" : "1px solid #DFDFD8",
          borderRadius: 99,
          padding: "4px 9px",
          fontSize: 10.5,
          fontWeight: 700,
        }}
      >
        Today
      </button>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        style={{
          border: "1px solid #DFDFD8",
          borderRadius: 8,
          padding: "3px 6px",
          fontSize: 10.5,
          fontWeight: 700,
          color: "#7C7C73",
          background: "#FBFBF8",
          outline: "none",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Clear due date"
          style={{ background: "transparent", border: 0, fontSize: 13, fontWeight: 700, color: "#B0B0A7", padding: "0 2px" }}
        >
          ×
        </button>
      )}
    </div>
  );
}

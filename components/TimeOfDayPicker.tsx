"use client";

import { TIME_OF_DAY_LABELS, TIME_OF_DAY_OPTIONS, type TimeOfDay } from "@/lib/time-of-day";

// A booking hint, not a due date — "roughly when in the day", surfaced to
// the chat so schedule_task can pick a slot that matches when the user
// hasn't given it an exact time. Same plain-text/editing split as
// DueDatePicker: `editing` false shows a short label (gated behind the
// same pencil toggle as the other fields on a row), `editing` true shows
// three toggle chips — clicking the already-selected one clears it, since
// "no preference" is a real, common state, not a gap to fill in.

interface Props {
  value: TimeOfDay | null;
  editing: boolean;
  onChange: (value: TimeOfDay | null) => void;
}

export default function TimeOfDayPicker({ value, editing, onChange }: Props) {
  if (!editing) {
    return (
      <span
        style={{
          flex: "none",
          fontSize: 10.5,
          fontWeight: 700,
          color: value ? "#93938A" : "#C4C4BB",
          letterSpacing: ".02em",
        }}
      >
        {value ? TIME_OF_DAY_LABELS[value] : "any time"}
      </span>
    );
  }

  return (
    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 5 }}>
      {TIME_OF_DAY_OPTIONS.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            // Safari doesn't focus <button>s on tap, so without this the
            // row's group-blur handler (which closes edit mode when focus
            // leaves the group) sees a null relatedTarget on the name
            // input's blur and closes the row before the tap's click event
            // fires — the button unmounts mid-tap and the press is a no-op.
            // Blocking the mousedown/touch focus-shift keeps focus on the
            // input, so blur never fires and the click lands normally.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange(on ? null : opt)}
            className="mb-chip"
            style={{
              background: on ? "#14140F" : "#FFFFFF",
              color: on ? "#FFFFFF" : "#93938A",
              border: on ? "1px solid #14140F" : "1px solid #DFDFD8",
              borderRadius: 99,
              padding: "4px 9px",
              fontSize: 10.5,
              fontWeight: 700,
            }}
          >
            {TIME_OF_DAY_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}

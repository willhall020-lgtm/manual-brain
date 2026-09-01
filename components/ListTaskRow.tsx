"use client";

import type { KeyboardEvent } from "react";
import DurationInput from "@/components/DurationInput";
import DueDatePicker from "@/components/DueDatePicker";
import TimeOfDayPicker from "@/components/TimeOfDayPicker";
import type { TimeOfDay } from "@/lib/time-of-day";
import type { RepeatFrequency } from "@/lib/repeat";

interface Props {
  name: string;
  dueDate: string | null;
  todayKey: string;
  durationMinutes: number | null;
  timeOfDay: TimeOfDay | null;
  repeatFrequency: RepeatFrequency | null;
  editing: boolean;
  editVal: string;
  onDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditChange: (v: string) => void;
  onEditKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur: () => void;
  onDurationCommit: (minutes: number | null) => void;
  onDueDateChange: (v: string | null) => void;
  onTimeOfDayChange: (v: TimeOfDay | null) => void;
  onRepeatChange: (v: RepeatFrequency | null) => void;
}

export default function ListTaskRow({
  name,
  dueDate,
  todayKey,
  durationMinutes,
  timeOfDay,
  repeatFrequency,
  editing,
  editVal,
  onDone,
  onEdit,
  onDelete,
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  onDurationCommit,
  onDueDateChange,
  onTimeOfDayChange,
  onRepeatChange,
}: Props) {
  return (
    <div
      className="mb-taskrow"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: "#FFFFFF",
        border: "1px solid #E6E6E0",
        borderRadius: 14,
        padding: "12px 12px 12px 13px",
      }}
    >
      <button
        onClick={onDone}
        title="Mark done"
        className="mb-donebtn"
        style={{
          flex: "none",
          width: 20,
          height: 20,
          padding: 0,
          borderRadius: 99,
          border: "1.5px solid #C7C7BE",
          background: "#FFFFFF",
        }}
      />
      <div
        style={{ display: "contents" }}
        onClick={() => {
          // Tap-to-edit: the name/date/duration/time-of-day content has
          // no other click handler of its own while not editing (they're
          // plain text), so this is a safe, dead-space catch-all — no
          // button lives in here to conflict with. Guarded on `editing`
          // so tapping the already-open inputs doesn't re-fire startEdit
          // and stomp an in-progress edit back to the task's saved name.
          if (!editing) onEdit();
        }}
        onBlur={(e) => {
          // The name, due-date, and duration fields are one edit group —
          // tabbing/clicking between them shouldn't close the group, only
          // losing focus to something outside it should.
          if (editing && !e.currentTarget.contains(e.relatedTarget as Node)) {
            onEditBlur();
          }
        }}
      >
        <div className="mb-taskrow-name" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          {editing ? (
            <input
              value={editVal}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={onEditKeyDown}
              autoFocus
              style={{
                width: "100%",
                fontSize: 14.5,
                fontWeight: 600,
                border: 0,
                borderBottom: "2px solid #2B34EE",
                background: "transparent",
                outline: "none",
                padding: "1px 0",
              }}
            />
          ) : (
            <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.3, cursor: "pointer" }}>
              {name}
            </span>
          )}
        </div>

        <DueDatePicker
          value={dueDate}
          todayKey={todayKey}
          editing={editing}
          onChange={onDueDateChange}
          repeatFrequency={repeatFrequency}
          onRepeatChange={onRepeatChange}
        />
        <DurationInput minutes={durationMinutes} editing={editing} onCommit={onDurationCommit} />
        <TimeOfDayPicker value={timeOfDay} editing={editing} onChange={onTimeOfDayChange} />
      </div>

      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 2 }}>
        <button
          onClick={onEdit}
          title="Edit"
          className="mb-iconbtn"
          style={{ width: 25, height: 25, padding: 0, border: 0, borderRadius: 8, background: "transparent", color: "#A3A39A", fontSize: 13 }}
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="mb-iconbtn-danger"
          style={{ width: 25, height: 25, padding: 0, border: 0, borderRadius: 8, background: "transparent", color: "#A3A39A", fontSize: 12 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

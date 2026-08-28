"use client";

import type { KeyboardEvent } from "react";
import DurationInput from "@/components/DurationInput";
import DueDatePicker from "@/components/DueDatePicker";

interface Props {
  name: string;
  dueDate: string | null;
  todayKey: string;
  durationMinutes: number | null;
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
}

export default function ListTaskRow({
  name,
  dueDate,
  todayKey,
  durationMinutes,
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
}: Props) {
  return (
    <div
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
        onBlur={(e) => {
          // The name, due-date, and duration fields are one edit group —
          // tabbing/clicking between them shouldn't close the group, only
          // losing focus to something outside it should.
          if (editing && !e.currentTarget.contains(e.relatedTarget as Node)) {
            onEditBlur();
          }
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
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
            <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.3 }}>
              {name}
            </span>
          )}
        </div>

        <DueDatePicker value={dueDate} todayKey={todayKey} editing={editing} onChange={onDueDateChange} />
        <DurationInput minutes={durationMinutes} editing={editing} onCommit={onDurationCommit} />
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

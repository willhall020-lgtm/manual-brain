"use client";

import type { KeyboardEvent } from "react";
import DurationInput from "@/components/DurationInput";
import DueDatePicker from "@/components/DueDatePicker";
import TimeOfDayPicker from "@/components/TimeOfDayPicker";
import BookButton from "@/components/BookButton";
import type { TimeOfDay } from "@/lib/time-of-day";

interface Props {
  name: string;
  sectionName: string;
  dueDate: string | null;
  todayKey: string;
  durationMinutes: number | null;
  timeOfDay: TimeOfDay | null;
  booked: boolean;
  booking: boolean;
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
  onBook: () => void;
}

export default function TodayTaskRow({
  name,
  sectionName,
  dueDate,
  todayKey,
  durationMinutes,
  timeOfDay,
  booked,
  booking,
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
  onBook,
}: Props) {
  return (
    <div
      className="mb-taskrow"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: "#FFFFFF",
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
          width: 21,
          height: 21,
          padding: 0,
          borderRadius: 99,
          border: "1.5px solid #C7C7BE",
          background: "#FFFFFF",
        }}
      />
      <div
        style={{ display: "contents" }}
        onBlur={(e) => {
          // The name input and the duration input are two separate fields
          // in the same edit group — tabbing between them shouldn't close
          // the group, only losing focus to something outside it should.
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
                fontSize: 15,
                fontWeight: 600,
                border: 0,
                borderBottom: "2px solid #2B34EE",
                background: "transparent",
                outline: "none",
                padding: "1px 0",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-.01em",
                lineHeight: 1.3,
              }}
            >
              {name}
            </span>
          )}
        </div>
        <span
          style={{
            flex: "none",
            background: "#F2F2EE",
            color: "#7C7C73",
            borderRadius: 99,
            padding: "4px 10px",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          {sectionName}
        </span>
        <DueDatePicker value={dueDate} todayKey={todayKey} editing={editing} onChange={onDueDateChange} />
        <DurationInput minutes={durationMinutes} editing={editing} onCommit={onDurationCommit} />
        <TimeOfDayPicker value={timeOfDay} editing={editing} onChange={onTimeOfDayChange} />
      </div>
      <BookButton booked={booked} booking={booking} onBook={onBook} />
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 2 }}>
        <button
          onClick={onEdit}
          title="Edit"
          className="mb-iconbtn"
          style={{
            width: 25,
            height: 25,
            padding: 0,
            border: 0,
            borderRadius: 8,
            background: "transparent",
            color: "#A3A39A",
            fontSize: 13,
          }}
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="mb-iconbtn-danger"
          style={{
            width: 25,
            height: 25,
            padding: 0,
            border: 0,
            borderRadius: 8,
            background: "transparent",
            color: "#A3A39A",
            fontSize: 12,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

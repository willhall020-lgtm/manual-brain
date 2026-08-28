"use client";

import type { KeyboardEvent } from "react";
import DurationInput from "@/components/DurationInput";

interface Props {
  name: string;
  sectionName: string;
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
}

export default function TodayTaskRow({
  name,
  sectionName,
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
}: Props) {
  return (
    <div
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
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        {editing ? (
          <input
            value={editVal}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            onBlur={onEditBlur}
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
      <DurationInput minutes={durationMinutes} onCommit={onDurationCommit} />
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

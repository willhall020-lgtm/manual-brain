"use client";

import type { KeyboardEvent } from "react";
import { URGENCY, UrgencyKey, urgencyLabel, urgencyMeta } from "@/lib/urgency";
import DurationInput from "@/components/DurationInput";

interface Props {
  name: string;
  urgency: UrgencyKey;
  customLabel: string | null;
  urgencyDisplay: "pill" | "dot";
  durationMinutes: number | null;
  editing: boolean;
  editVal: string;
  menuOpen: boolean;
  onDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditChange: (v: string) => void;
  onEditKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEditBlur: () => void;
  onToggleMenu: () => void;
  onPickUrgency: (k: UrgencyKey) => void;
  onDurationCommit: (minutes: number | null) => void;
}

export default function ListTaskRow({
  name,
  urgency,
  customLabel,
  urgencyDisplay,
  durationMinutes,
  editing,
  editVal,
  menuOpen,
  onDone,
  onEdit,
  onDelete,
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  onToggleMenu,
  onPickUrgency,
  onDurationCommit,
}: Props) {
  const meta = urgencyMeta(urgency);
  const label = urgencyLabel(urgency, customLabel);
  const asDot = urgencyDisplay === "dot";

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

      <div className="mb-menu-anchor" style={{ flex: "none", position: "relative" }}>
        {asDot ? (
          <button
            onClick={onToggleMenu}
            title={label}
            className="mb-urgpill"
            style={{
              width: 13,
              height: 13,
              padding: 0,
              borderRadius: 99,
              background: meta.bg,
              border: meta.bd,
              display: "block",
            }}
          />
        ) : (
          <button
            onClick={onToggleMenu}
            className="mb-urgpill"
            style={{
              background: meta.bg,
              color: meta.fg,
              border: meta.bd,
              borderRadius: 99,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".02em",
              whiteSpace: "nowrap",
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </button>
        )}

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 7px)",
              right: 0,
              zIndex: 30,
              width: 186,
              background: "#FFFFFF",
              border: "1px solid #E4E4DE",
              borderRadius: 13,
              padding: 6,
              boxShadow: "0 14px 34px rgba(20,20,15,.14)",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {URGENCY.map((u) => (
              <button
                key={u.k}
                onClick={() => onPickUrgency(u.k)}
                className="mb-menuitem"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  padding: "7px 8px",
                  border: 0,
                  borderRadius: 9,
                  background: "transparent",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#14140F",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: u.bg,
                    border: u.bd,
                  }}
                />
                {u.k}
              </button>
            ))}
          </div>
        )}
      </div>

      <DurationInput minutes={durationMinutes} onCommit={onDurationCommit} />

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

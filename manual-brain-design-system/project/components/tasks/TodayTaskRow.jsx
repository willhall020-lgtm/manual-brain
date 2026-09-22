import React from "react";
import { CheckCircle } from "./CheckCircle.jsx";
import { IconButton } from "../forms/IconButton.jsx";

export function TodayTaskRow({ name, sectionName, editing = false, editVal = "", onDone, onEdit, onDelete, onEditChange, onEditKeyDown, onEditBlur }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-row-inner)", background: "var(--surface-card)", borderRadius: "var(--radius-row)", padding: "var(--pad-row)" }}>
      <CheckCircle size={21} onClick={onDone} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        {editing ? (
          <input
            value={editVal}
            onChange={(e) => onEditChange && onEditChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            onBlur={onEditBlur}
            autoFocus
            style={{ width: "100%", fontSize: "var(--fs-body-lg)", fontWeight: "var(--fw-semibold)", border: 0, borderBottom: "2px solid var(--accent-focus)", background: "transparent", outline: "none", padding: "1px 0", textTransform: "lowercase" }}
          />
        ) : (
          <span style={{ fontSize: "var(--fs-body-lg)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", lineHeight: "var(--lh-snug)", textTransform: "lowercase" }}>{name}</span>
        )}
      </div>
      <span style={{ flex: "none", background: "var(--mb-n-150)", color: "var(--mb-g-800)", borderRadius: "var(--radius-pill)", padding: "4px 10px", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tag)", textTransform: "lowercase" }}>{sectionName}</span>
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton glyph="✎" title="Edit" onClick={onEdit} />
        <IconButton glyph="✕" title="Delete" tone="danger" onClick={onDelete} />
      </div>
    </div>
  );
}

import React from "react";
import { CheckCircle } from "./CheckCircle.jsx";
import { UrgencyPill } from "./UrgencyPill.jsx";
import { UrgencyMenu } from "./UrgencyMenu.jsx";
import { IconButton } from "../forms/IconButton.jsx";

export function ListTaskRow({ name, urgency = "Today", customLabel = null, urgencyDisplay = "pill", editing = false, editVal = "", menuOpen = false, onDone, onEdit, onDelete, onEditChange, onEditKeyDown, onEditBlur, onToggleMenu, onPickUrgency }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-row-inner)", background: "var(--surface-card)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-row)", padding: "var(--pad-row)" }}>
      <CheckCircle size={20} onClick={onDone} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        {editing ? (
          <input
            value={editVal}
            onChange={(e) => onEditChange && onEditChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            onBlur={onEditBlur}
            autoFocus
            style={{ width: "100%", fontSize: "var(--fs-body)", fontWeight: "var(--fw-semibold)", border: 0, borderBottom: "2px solid var(--accent-focus)", background: "transparent", outline: "none", padding: "1px 0", textTransform: "lowercase" }}
          />
        ) : (
          <span style={{ fontSize: "var(--fs-body)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", lineHeight: "var(--lh-snug)", textTransform: "lowercase" }}>{name}</span>
        )}
      </div>
      <div className="mb-menu-anchor" style={{ flex: "none", position: "relative" }}>
        <UrgencyPill urgency={urgency} customLabel={customLabel} display={urgencyDisplay} onClick={onToggleMenu} />
        {menuOpen && <UrgencyMenu onPick={onPickUrgency} />}
      </div>
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton glyph="✎" title="Edit" onClick={onEdit} />
        <IconButton glyph="✕" title="Delete" tone="danger" onClick={onDelete} />
      </div>
    </div>
  );
}

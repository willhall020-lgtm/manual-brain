import React from "react";
import { Chip } from "./Chip.jsx";
import { UrgencyChipRow } from "./UrgencyChipRow.jsx";
import { AddButton } from "./AddButton.jsx";

const labelStyle = { fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-eyebrow)", color: "var(--icon-rest)" };

export function QuickAddBox({ open = false, text = "", urgency = "Today", custom = "", sections = [], selectedSectionId, onOpen, onCancel, onTextChange, onCustomChange, onUrgencyChange, onSectionPick, onKeyDown, onAdd }) {
  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="mb-quickadd-rest"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px dashed var(--mb-lime-dashed)", borderRadius: "var(--radius-row)", padding: "11px 12px", textAlign: "left", color: "var(--text-on-lime)", fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-bold)" }}
      >
        <span style={{ flex: "none", fontSize: 16, fontWeight: "var(--fw-bold)", lineHeight: 1 }}>+</span>
        add something for today
      </button>
    );
  }
  const filled = !!text.trim();
  return (
    <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-box)", padding: "13px 13px 11px", display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        value={text}
        onChange={(e) => onTextChange && onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
        placeholder="what needs doing?"
        style={{ width: "100%", border: 0, outline: "none", background: "transparent", fontSize: "var(--fs-body-lg)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", padding: 1, textTransform: "lowercase" }}
      />
      <div style={{ height: 1, background: "var(--mb-n-400)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={labelStyle}>which list?</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {sections.map((s) => (
            <Chip key={s.id} label={s.name} selected={selectedSectionId === s.id} onClick={() => onSectionPick && onSectionPick(s.id)} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={labelStyle}>how urgent?</span>
        <UrgencyChipRow value={urgency} onChange={onUrgencyChange} />
        {urgency === "Custom" && (
          <input
            value={custom}
            onChange={(e) => onCustomChange && onCustomChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="type your own — e.g. before sam visits"
            style={{ width: "100%", border: "1px dashed var(--mb-g-200)", borderRadius: "var(--radius-input)", padding: "7px 10px", fontSize: 12, fontWeight: "var(--fw-semibold)", outline: "none", background: "var(--surface-input)", textTransform: "lowercase" }}
          />
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)", color: "var(--text-faint)" }}>enter to add · esc to close</span>
        <button onClick={onCancel} className="mb-cancel" style={{ background: "transparent", border: 0, color: "var(--text-subtle)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)", padding: "6px 4px" }}>cancel</button>
        <AddButton filled={filled} onClick={onAdd} />
      </div>
    </div>
  );
}

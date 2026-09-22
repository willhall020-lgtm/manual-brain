import React from "react";
import { Sheet } from "./Sheet.jsx";
import { Chip } from "../forms/Chip.jsx";
import { UrgencyChipRow } from "../forms/UrgencyChipRow.jsx";

const label = { fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-eyebrow)", color: "var(--icon-rest)" };
const field = { width: "100%", border: "1px solid var(--border-control)", borderRadius: "var(--radius-input)", padding: "11px 12px", fontSize: 14, fontWeight: "var(--fw-semibold)", outline: "none", background: "var(--surface-input)", minHeight: 44 };

export const DURATIONS = [15, 30, 45, 60, 90];
export const WHENS = ["any time", "morning", "afternoon", "evening"];
export const REPEATS = ["never", "daily", "weekly", "monthly"];

export function AddSheet({ open = false, text = "", urgency = "Today", custom = "", due = "", minutes = null, when = "any time", repeat = "never", sections = [], selectedSectionId, onClose, onTextChange, onCustomChange, onUrgencyChange, onSectionPick, onDueChange, onMinutesChange, onWhenChange, onRepeatChange, onAdd }) {
  const filled = !!text.trim();
  return (
    <Sheet open={open} onClose={onClose} height="86%">
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 4 }}>
        <input
          value={text}
          onChange={(e) => onTextChange && onTextChange(e.target.value)}
          autoFocus
          placeholder="what needs doing?"
          style={{ width: "100%", border: 0, borderBottom: "2px solid var(--accent-focus)", outline: "none", background: "transparent", fontSize: 17, fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", padding: "4px 0 8px", textTransform: "lowercase" }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>which list?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sections.map((s) => (
              <Chip key={s.id} label={s.name} size="touch" selected={selectedSectionId === s.id} onClick={() => onSectionPick && onSectionPick(s.id)} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>how urgent?</span>
          <UrgencyChipRow value={urgency} size="touch" onChange={onUrgencyChange} />
          {urgency === "Custom" && (
            <input
              value={custom}
              onChange={(e) => onCustomChange && onCustomChange(e.target.value)}
              placeholder="type your own — e.g. before sam visits"
              style={{ ...field, border: "1px dashed var(--mb-g-200)", textTransform: "lowercase" }}
            />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>due date</span>
          <input type="date" value={due || ""} onChange={(e) => onDueChange && onDueChange(e.target.value)} style={field} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>how long?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DURATIONS.map((m) => (
              <Chip key={m} label={m >= 60 && m % 60 === 0 ? m / 60 + " hr" : m + " min"} size="touch" selected={minutes === m} onClick={() => onMinutesChange && onMinutesChange(minutes === m ? null : m)} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>when?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {WHENS.map((w) => (
              <Chip key={w} label={w} size="touch" selected={when === w} onClick={() => onWhenChange && onWhenChange(w)} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>repeats?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {REPEATS.map((r) => (
              <Chip key={r} label={r} size="touch" selected={repeat === r} onClick={() => onRepeatChange && onRepeatChange(r)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
        <button onClick={onClose} className="mb-cancel" style={{ flex: "none", minHeight: 46, background: "transparent", border: 0, color: "var(--text-subtle)", fontSize: 12.5, fontWeight: "var(--fw-bold)", padding: "0 6px" }}>cancel</button>
        <button
          onClick={onAdd}
          className="mb-addbtn"
          style={{ flex: 1, minHeight: 46, background: filled ? "var(--mb-ink)" : "var(--mb-n-600)", color: filled ? "#FFFFFF" : "var(--icon-rest)", border: 0, borderRadius: "var(--radius-pill)", fontSize: 12.5, fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-button)" }}
        >
          add task
        </button>
      </div>
    </Sheet>
  );
}

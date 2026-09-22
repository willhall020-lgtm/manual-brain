import React from "react";
import { Sheet } from "./Sheet.jsx";
import { Chip } from "../forms/Chip.jsx";
import { UrgencyChipRow } from "../forms/UrgencyChipRow.jsx";
import { DURATIONS, WHENS, REPEATS } from "./AddSheet.jsx";

const label = { fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-eyebrow)", color: "var(--icon-rest)" };
const field = { width: "100%", border: "1px solid var(--border-control)", borderRadius: "var(--radius-input)", padding: "11px 12px", fontSize: 14, fontWeight: "var(--fw-semibold)", outline: "none", background: "var(--surface-input)", minHeight: 44 };

export function TaskSheet({ open = false, task = null, sections = [], onClose, onChange, onSave, onDelete, onDone }) {
  if (!task) return null;
  const set = (patch) => onChange && onChange(patch);
  const named = !!(task.name || "").trim();
  return (
    <Sheet open={open} onClose={onClose} height="88%">
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 4 }}>
        <input
          value={task.name || ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="what needs doing?"
          style={{ width: "100%", border: 0, borderBottom: "2px solid var(--accent-focus)", outline: "none", background: "transparent", fontSize: 17, fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", padding: "4px 0 8px", textTransform: "lowercase" }}
        />

        <button
          onClick={onDone}
          className="mb-listadd-rest"
          style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 48, background: "transparent", border: "1px dashed var(--border-dashed)", borderRadius: "var(--radius-row)", padding: "0 13px", fontSize: 13.5, fontWeight: "var(--fw-bold)", color: "var(--text-subtle)", textAlign: "left" }}
        >
          <span style={{ flex: "none", width: 21, height: 21, borderRadius: "var(--radius-pill)", border: "1.5px solid var(--border-check)", background: "var(--surface-card)" }} />
          mark it done
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>which list?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sections.map((s) => (
              <Chip key={s.id} label={s.name} size="touch" selected={task.sectionId === s.id} onClick={() => set({ sectionId: s.id })} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>how urgent?</span>
          <UrgencyChipRow value={task.urgency} size="touch" onChange={(k) => set({ urgency: k, customLabel: k === "Custom" ? task.customLabel || "" : null })} />
          {task.urgency === "Custom" && (
            <input
              value={task.customLabel || ""}
              onChange={(e) => set({ customLabel: e.target.value })}
              placeholder="type your own — e.g. before sam visits"
              style={{ ...field, border: "1px dashed var(--mb-g-200)", textTransform: "lowercase" }}
            />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>due date</span>
          <input type="date" value={task.dueISO || ""} onChange={(e) => set({ dueISO: e.target.value })} style={field} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>how long?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DURATIONS.map((m) => (
              <Chip key={m} label={m >= 60 && m % 60 === 0 ? m / 60 + " hr" : m + " min"} size="touch" selected={task.minutes === m} onClick={() => set({ minutes: task.minutes === m ? null : m })} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>when?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {WHENS.map((w) => (
              <Chip key={w} label={w} size="touch" selected={task.when === w} onClick={() => set({ when: w })} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>repeats?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {REPEATS.map((r) => (
              <Chip key={r} label={r} size="touch" selected={(task.repeat || "never") === r} onClick={() => set({ repeat: r })} />
            ))}
          </div>
        </div>

        <button
          onClick={onDelete}
          style={{ alignSelf: "flex-start", minHeight: 44, background: "transparent", border: 0, padding: "0 2px", color: "var(--danger)", fontSize: 12.5, fontWeight: "var(--fw-bold)" }}
        >
          delete this task
        </button>
      </div>

      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
        <button onClick={onClose} className="mb-cancel" style={{ flex: "none", minHeight: 46, background: "transparent", border: 0, color: "var(--text-subtle)", fontSize: 12.5, fontWeight: "var(--fw-bold)", padding: "0 6px" }}>cancel</button>
        <button
          onClick={onSave}
          className="mb-addbtn"
          style={{ flex: 1, minHeight: 46, background: named ? "var(--mb-ink)" : "var(--mb-n-600)", color: named ? "#FFFFFF" : "var(--icon-rest)", border: 0, borderRadius: "var(--radius-pill)", fontSize: 12.5, fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-button)" }}
        >
          save
        </button>
      </div>
    </Sheet>
  );
}

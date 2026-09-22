import React from "react";

export function ChatComposer({ value = "", placeholder = "ask your brain…", busy = false, onChange, onSend }) {
  const ready = !!value.trim() && !busy;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 9, padding: "10px 16px 12px", background: "var(--bg-page)", borderTop: "1px solid var(--border-card)" }}>
      <input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && ready) onSend && onSend(); }}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, minHeight: 46, background: "var(--surface-card)", border: "1px solid var(--border-control)", borderRadius: "var(--radius-pill)", padding: "0 16px", fontSize: "var(--fs-body-lg)", fontWeight: "var(--fw-medium)", letterSpacing: "var(--ls-tight)", outline: "none", textTransform: "lowercase" }}
      />
      <button
        onClick={() => ready && onSend && onSend()}
        className="mb-addbtn"
        style={{ flex: "none", width: 46, height: 46, borderRadius: "var(--radius-pill)", border: 0, background: ready ? "var(--mb-ink)" : "var(--mb-n-600)", color: ready ? "#FFFFFF" : "var(--icon-rest)", fontSize: 15, fontWeight: "var(--fw-bold)" }}
      >
        ↑
      </button>
    </div>
  );
}

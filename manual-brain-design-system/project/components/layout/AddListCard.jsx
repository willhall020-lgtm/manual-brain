import React from "react";

export function AddListCard({ adding = false, value = "", onOpen, onChange, onKeyDown, onCreate }) {
  if (!adding) {
    return (
      <button
        onClick={onOpen}
        className="mb-addlist"
        style={{ background: "transparent", border: "1.5px dashed var(--border-dashed)", borderRadius: "var(--radius-card)", color: "var(--text-subtle)", fontSize: "var(--fs-body)", fontWeight: "var(--fw-bold)", padding: 16, minHeight: "var(--list-card-height)", display: "flex", alignItems: "flex-end", textAlign: "left" }}
      >
        + add a list
      </button>
    );
  }
  return (
    <div style={{ background: "var(--surface-card)", border: "1.5px solid var(--border-strong)", borderRadius: "var(--radius-card)", padding: 16, display: "flex", flexDirection: "column", gap: 12, minHeight: "var(--list-card-height)" }}>
      <input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
        placeholder="list name"
        style={{ width: "100%", border: 0, borderBottom: "2px solid var(--accent-focus)", outline: "none", background: "transparent", fontSize: 16, fontWeight: "var(--fw-black)", letterSpacing: "-.02em", padding: "2px 0", textTransform: "lowercase" }}
      />
      <button
        onClick={onCreate}
        style={{ marginTop: "auto", background: "var(--mb-ink)", color: "#FFFFFF", border: 0, borderRadius: "var(--radius-pill)", padding: "8px 12px", fontSize: "var(--fs-chip)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-button)" }}
      >
        create list
      </button>
    </div>
  );
}

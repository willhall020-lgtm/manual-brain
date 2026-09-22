import React from "react";

export function Chip({ label, selected = false, tone = "ink", size = "md", onClick }) {
  const on = selected;
  const sel = tone === "ink"
    ? { background: "var(--mb-ink)", color: "#FFFFFF", border: "1px solid var(--mb-ink)" }
    : { background: "var(--mb-lime)", color: "var(--mb-ink)", border: "1px solid var(--mb-lime-border)" };
  return (
    <button
      type="button"
      className="mb-chip"
      onClick={onClick}
      style={{
        ...(on ? sel : { background: "var(--surface-card)", color: "var(--text-subtle)", border: "1px solid var(--border-control)" }),
        borderRadius: "var(--radius-pill)", whiteSpace: "nowrap",
        padding: size === "touch" ? "12px 16px" : "5px 11px",
        minHeight: size === "touch" ? 44 : undefined,
        fontSize: size === "touch" ? 13 : "var(--fs-chip)", fontWeight: "var(--fw-bold)", textTransform: "lowercase",
      }}
    >
      {label}
    </button>
  );
}

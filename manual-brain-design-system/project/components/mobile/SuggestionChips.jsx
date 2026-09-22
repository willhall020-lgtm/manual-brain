import React from "react";

export function SuggestionChips({ items = [], onPick }) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onPick && onPick(s)}
          className="mb-listadd-rest"
          style={{ background: "transparent", border: "1px dashed var(--border-dashed)", borderRadius: "var(--radius-pill)", padding: "9px 13px", minHeight: 40, fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-subtle)" }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

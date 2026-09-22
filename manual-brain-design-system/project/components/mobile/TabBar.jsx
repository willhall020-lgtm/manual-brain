import React from "react";

export function TabBar({ tabs = [], active, onSelect }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", gap: 2, background: "var(--surface-card)", borderTop: "1px solid var(--border-card)", padding: "0 8px" }}>
      {tabs.map((t) => {
        const on = t.id === active;
        const color = on ? "var(--text-body)" : "var(--mb-g-850)";
        return (
          <button
            key={t.id}
            onClick={() => onSelect && onSelect(t.id)}
            title={t.label}
            aria-label={t.label}
            aria-current={on ? "page" : undefined}
            style={{ flex: "none", minWidth: 46, minHeight: 46, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", border: 0, padding: t.glyph ? "7px 6px 8px" : "7px 12px 8px" }}
          >
            {t.glyph ? (
              <span style={{ fontSize: 17, lineHeight: 1, color, fontWeight: "var(--fw-medium)" }}>{t.glyph}</span>
            ) : (
              <span style={{ fontSize: "var(--fs-meta)", fontWeight: "var(--fw-black)", letterSpacing: ".04em", color }}>{t.label}</span>
            )}
            <span style={{ width: 20, height: 2, borderRadius: "var(--radius-pill)", background: on ? "var(--mb-lime)" : "transparent" }} />
          </button>
        );
      })}
    </div>
  );
}

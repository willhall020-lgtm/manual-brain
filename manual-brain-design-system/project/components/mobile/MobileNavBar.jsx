import React from "react";

export function MobileNavBar({ dateLabel, title = "manual brain", meta, onBack, backLabel = "← all lists" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 16px 12px", background: "var(--bg-page)" }}>
      {onBack ? (
        <button onClick={onBack} className="mb-backbtn" style={{ alignSelf: "flex-start", minHeight: 34, background: "transparent", border: "1.5px solid var(--mb-n-750)", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap", padding: "7px 14px", fontSize: 12, fontWeight: "var(--fw-bold)", color: "var(--text-body)" }}>{backLabel}</button>
      ) : (
        dateLabel && <span style={{ fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-eyebrow)", color: "var(--text-muted)" }}>{dateLabel}</span>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 27, fontWeight: "var(--fw-black)", letterSpacing: "-.035em", lineHeight: 1, textTransform: "lowercase" }}>{title}</h1>
        {meta && <span style={{ flex: "none", fontSize: 11.5, fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", paddingBottom: 1 }}>{meta}</span>}
      </div>
    </div>
  );
}

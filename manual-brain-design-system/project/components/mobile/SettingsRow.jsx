import React from "react";

export function SettingsRow({ label, description, value, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, background: "var(--surface-card)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-row)", padding: "14px 14px 13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: "var(--fs-body)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tight)", textTransform: "lowercase" }}>{label}</span>
        {value && <span style={{ flex: "none", fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-semibold)", color: "var(--mb-g-850)", textTransform: "lowercase" }}>{value}</span>}
      </div>
      {description && (
        <span style={{ fontSize: "var(--fs-meta)", fontWeight: "var(--fw-medium)", color: "var(--mb-g-850)", lineHeight: "var(--lh-snug)" }}>{description}</span>
      )}
      {children && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 1 }}>{children}</div>}
    </div>
  );
}

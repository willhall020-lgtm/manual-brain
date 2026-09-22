import React from "react";

export function Sheet({ open = false, title, onClose, children, height = "auto" }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <button onClick={onClose} aria-label="Close" style={{ position: "absolute", inset: 0, border: 0, padding: 0, background: "rgba(20,20,15,.28)" }} />
      <div style={{ position: "relative", background: "var(--surface-card)", borderRadius: "var(--radius-panel) var(--radius-panel) 0 0", padding: "10px 16px 30px", display: "flex", flexDirection: "column", gap: 14, height, boxShadow: "var(--shadow-menu)" }}>
        <span style={{ alignSelf: "center", width: 38, height: 4, borderRadius: "var(--radius-pill)", background: "var(--mb-n-750)" }} />
        {title && <span style={{ fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-eyebrow)", color: "var(--icon-rest)" }}>{title}</span>}
        {children}
      </div>
    </div>
  );
}

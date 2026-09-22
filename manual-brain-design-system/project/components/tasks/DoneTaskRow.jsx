import React from "react";
import { IconButton } from "../forms/IconButton.jsx";

export function DoneTaskRow({ name, sectionName, onUndo }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-card)", border: "1px solid var(--mb-n-500)", borderRadius: "var(--radius-row)", padding: "9px 10px 9px 12px" }}>
      <span style={{ flex: "none", width: 17, height: 17, borderRadius: "var(--radius-pill)", background: "var(--accent-focus)", color: "#FFFFFF", fontSize: 9, fontWeight: "var(--fw-black)", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: "var(--fs-meta)", fontWeight: "var(--fw-medium)", color: "var(--text-done)", textDecoration: "line-through", textTransform: "lowercase" }}>{name}</span>
      <span style={{ flex: "none", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)", color: "var(--text-faint)", letterSpacing: ".02em", textTransform: "lowercase" }}>{sectionName}</span>
      <IconButton glyph="↺" title="Move back" size={24} onClick={onUndo} />
    </div>
  );
}

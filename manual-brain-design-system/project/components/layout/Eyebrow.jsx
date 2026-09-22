import React from "react";

export function Eyebrow({ children, tone = "muted" }) {
  const color = tone === "ink" ? "var(--text-body)" : tone === "faint" ? "var(--text-faint)" : "var(--text-muted)";
  return (
    <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-eyebrow)", color }}>{children}</span>
  );
}

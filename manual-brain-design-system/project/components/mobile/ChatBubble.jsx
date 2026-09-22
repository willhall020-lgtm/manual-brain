import React from "react";

export function ChatBubble({ from = "brain", children, pending = false }) {
  const mine = from === "me";
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "84%",
          background: mine ? "var(--mb-ink)" : "var(--surface-card)",
          color: mine ? "#FFFFFF" : "var(--text-body)",
          border: mine ? "none" : "1px solid var(--border-card)",
          borderRadius: mine ? "var(--radius-box) var(--radius-box) 5px var(--radius-box)" : "var(--radius-box) var(--radius-box) var(--radius-box) 5px",
          padding: "11px 13px",
          fontSize: "var(--fs-body)",
          fontWeight: "var(--fw-medium)",
          lineHeight: "var(--lh-body)",
          letterSpacing: "var(--ls-tight)",
          opacity: pending ? 0.55 : 1,
          whiteSpace: "pre-wrap",
          textTransform: "lowercase",
        }}
      >
        {children}
      </div>
    </div>
  );
}

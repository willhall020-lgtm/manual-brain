import React from "react";

export function ErrorBanner({ message, onDismiss }) {
  return (
    <button
      onClick={onDismiss}
      style={{ textAlign: "left", background: "var(--danger-surface)", color: "var(--danger-strong)", border: 0, borderRadius: "var(--radius-row)", padding: "10px 14px", fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-semibold)", textTransform: "lowercase" }}
    >
      {message} — tap to dismiss
    </button>
  );
}

import React from "react";

export function AddButton({ label = "add ↵", filled = false, size = "md", onClick }) {
  return (
    <button
      onClick={onClick}
      className="mb-addbtn"
      style={{
        background: filled ? "var(--mb-ink)" : "var(--mb-n-600)",
        color: filled ? "#FFFFFF" : "var(--icon-rest)",
        border: 0, borderRadius: "var(--radius-pill)", whiteSpace: "nowrap",
        padding: size === "touch" ? "13px 20px" : "7px 15px",
        minHeight: size === "touch" ? 44 : undefined,
        fontSize: size === "touch" ? 12.5 : "var(--fs-chip)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-button)",
      }}
    >
      {label}
    </button>
  );
}

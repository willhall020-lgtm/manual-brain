import React from "react";

export function BackButton({ label = "← all lists", onClick }) {
  return (
    <button
      onClick={onClick}
      className="mb-backbtn"
      style={{ background: "transparent", border: "1.5px solid var(--mb-n-750)", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap", padding: "8px 15px", fontSize: 12, fontWeight: "var(--fw-bold)", color: "var(--text-body)" }}
    >
      {label}
    </button>
  );
}

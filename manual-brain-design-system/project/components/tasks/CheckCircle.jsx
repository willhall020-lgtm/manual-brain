import React from "react";

export function CheckCircle({ size = 21, hit = false, onClick, title = "Mark done" }) {
  const ring = {
    width: size, height: size,
    borderRadius: "var(--radius-pill)",
    border: "1.5px solid var(--border-check)",
    background: "var(--surface-card)",
  };
  // Touch path: the painted ring stays `size`, the pressable box is 44px.
  // Negative margin is vertical + leading only — never trailing, or the box
  // would reach into whatever sits next to it (see readme.md § Touch targets).
  if (hit) {
    const inset = -(44 - size) / 2;
    return (
      <button
        onClick={onClick}
        title={title}
        className="mb-donehit"
        style={{ flex: "none", width: 44, height: 44, margin: inset + "px 0 " + inset + "px " + inset + "px", padding: 0, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span className="mb-donering" style={ring} />
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      title={title}
      className="mb-donebtn"
      style={{ flex: "none", padding: 0, ...ring }}
    />
  );
}

import React from "react";

export function IconButton({ glyph, title, onClick, tone = "default", size = 25, hit = false }) {
  const box = {
    width: size, height: size,
    borderRadius: "var(--radius-icon)",
    color: "var(--icon-rest)",
    fontSize: glyph === "✕" ? 12 : 13,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  // Touch path: painted square stays `size`, pressable box is 44px.
  // Vertical negative margin only: a horizontal one would overlap the
  // control before it, and the later sibling wins the hit test.
  if (hit) {
    const inset = -(44 - size) / 2;
    return (
      <button
        onClick={onClick}
        title={title}
        aria-label={title}
        className={tone === "danger" ? "mb-iconhit-danger" : "mb-iconhit"}
        style={{ flex: "none", width: 44, height: 44, margin: inset + "px 0", padding: 0, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span className="mb-iconbox" style={box}>{glyph}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={tone === "danger" ? "mb-iconbtn-danger" : "mb-iconbtn"}
      style={{ padding: 0, border: 0, background: "transparent", ...box }}
    >
      {glyph}
    </button>
  );
}

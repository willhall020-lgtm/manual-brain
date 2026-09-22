import React from "react";

// The fixed set of relative urgency labels — verbatim from lib/urgency.ts.
// Manual Brain deliberately has no date picker: relative labels are quicker
// to scan and file than calendar dates.
export const URGENCY = [
  { k: "Today", bg: "#2B34EE", fg: "#FFFFFF", bd: "1px solid #2B34EE" },
  { k: "2–3 days", bg: "#D6EC3C", fg: "#14140F", bd: "1px solid #C6DC2C" },
  { k: "End of this week", bg: "#E3E5FD", fg: "#2B34EE", bd: "1px solid #D2D6FB" },
  { k: "This month", bg: "#EDEDE9", fg: "#6E6E67", bd: "1px solid #E2E2DD" },
  { k: "Custom", bg: "#FFFFFF", fg: "#14140F", bd: "1px dashed #A9A99F" },
];

export const SOON_KEYS = ["2–3 days", "End of this week"];

export function urgencyMeta(k) {
  return URGENCY.find((u) => u.k === k) || URGENCY[0];
}

export function urgencyLabel(urgency, customLabel) {
  return urgency === "Custom" ? customLabel || "Custom" : urgency;
}

export function UrgencyPill({ urgency = "Today", customLabel = null, display = "pill", hit = false, onClick, title }) {
  const meta = urgencyMeta(urgency);
  const label = urgencyLabel(urgency, customLabel);
  const isDot = display === "dot";

  const dotStyle = { display: "block", width: 13, height: 13, borderRadius: "var(--radius-pill)", background: meta.bg, border: meta.bd };
  const pillStyle = {
    display: "block",
    background: meta.bg, color: meta.fg, border: meta.bd,
    borderRadius: "var(--radius-pill)", padding: "4px 10px",
    fontSize: "var(--fs-chip)", fontWeight: "var(--fw-bold)", letterSpacing: ".02em",
    whiteSpace: "nowrap", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis",
    textTransform: "lowercase",
  };

  const visual = isDot
    ? <span className="mb-urgvis" style={dotStyle} />
    : <span className="mb-urgvis" style={pillStyle}>{label}</span>;

  // Touch path: the painted pill or 13px dot is unchanged, but it sits inside
  // a 44px pressable box. The negative margin is vertical ONLY — a horizontal
  // one would reach into the neighbouring control (delete), and the later
  // sibling wins the hit test, so tapping a pill could delete the task.
  if (hit) {
    return (
      <button
        onClick={onClick}
        title={title || label}
        aria-label={title || label}
        className="mb-urghit"
        style={{ flex: "none", minHeight: 44, minWidth: isDot ? 44 : 0, margin: "-9px 0", padding: 0, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {visual}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      className="mb-urgpill"
      style={{ flex: "none", padding: 0, border: 0, background: "transparent", display: "block" }}
    >
      {visual}
    </button>
  );
}

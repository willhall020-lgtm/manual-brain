// The only mobile part the design system doesn't already provide: the dashed
// "add" strip that sits at the bottom of a task group.
function MAddStrip({ label, tone = "grey", onClick }) {
  const lime = tone === "lime";
  return (
    <button onClick={onClick} className={lime ? "mb-quickadd-rest" : "mb-listadd-rest"}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "1px dashed " + (lime ? "var(--mb-lime-dashed)" : "var(--border-dashed)"), borderRadius: "var(--radius-row)", padding: "14px 13px", textAlign: "left", color: lime ? "var(--text-on-lime)" : "var(--text-subtle)", fontSize: 14, fontWeight: 700, minHeight: 48 }}>
      <span style={{ flex: "none", fontSize: 17, fontWeight: 700, lineHeight: 1 }}>+</span>
      {label}
    </button>
  );
}

Object.assign(window, { MAddStrip });

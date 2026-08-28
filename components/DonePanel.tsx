"use client";

interface DoneItem {
  id: string;
  name: string;
  sectionName: string;
}

interface Props {
  items: DoneItem[];
  open: boolean;
  onToggle: () => void;
  onUndo: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DonePanel({ items, open, onToggle, onUndo, onDelete }: Props) {
  return (
    <div style={{ background: "#EEEEEA", borderRadius: 22, padding: 6 }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: 0,
          padding: 12,
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#8E8E85" }}>
          DONE
        </span>
        <span
          style={{
            background: "#DCDCD5",
            color: "#5E5E56",
            borderRadius: 99,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {items.length}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#8E8E85" }}>
          {open ? "HIDE ▲" : "SHOW ▼"}
        </span>
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "0 8px 8px" }}>
          {items.map((d) => (
            <div
              key={d.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#FFFFFF",
                border: "1px solid #E9E9E3",
                borderRadius: 14,
                padding: "9px 10px 9px 12px",
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 17,
                  height: 17,
                  borderRadius: 99,
                  background: "#2B34EE",
                  color: "#FFFFFF",
                  fontSize: 9,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#9A9A91",
                  textDecoration: "line-through",
                }}
              >
                {d.name}
              </span>
              <span
                style={{
                  flex: "none",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#B0B0A7",
                  letterSpacing: ".02em",
                  textTransform: "uppercase",
                }}
              >
                {d.sectionName}
              </span>
              <button
                onClick={() => onUndo(d.id)}
                title="Move back"
                className="mb-iconbtn"
                style={{
                  flex: "none",
                  width: 24,
                  height: 24,
                  padding: 0,
                  border: 0,
                  borderRadius: 8,
                  background: "transparent",
                  color: "#A3A39A",
                  fontSize: 13,
                }}
              >
                ↺
              </button>
              <button
                onClick={() => onDelete(d.id)}
                title="Delete"
                className="mb-iconbtn-danger"
                style={{
                  flex: "none",
                  width: 24,
                  height: 24,
                  padding: 0,
                  border: 0,
                  borderRadius: 8,
                  background: "transparent",
                  color: "#A3A39A",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: "#A3A39A" }}>
              Nothing finished yet today.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

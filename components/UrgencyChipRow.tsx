"use client";

import { URGENCY, UrgencyKey } from "@/lib/urgency";

export default function UrgencyChipRow({
  value,
  onChange,
}: {
  value: UrgencyKey;
  onChange: (k: UrgencyKey) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {URGENCY.map((u) => {
        const on = value === u.k;
        return (
          <button
            key={u.k}
            type="button"
            className="mb-chip"
            onClick={() => onChange(u.k)}
            style={{
              background: on ? u.bg : "#FFFFFF",
              color: on ? u.fg : "#93938A",
              border: on ? u.bd : "1px solid #DFDFD8",
              borderRadius: 99,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {u.k}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

interface Props {
  initialValue: string;
  defaultValue: string;
}

export default function PreferencesForm({ initialValue, defaultValue }: Props) {
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = value !== savedValue;

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planningRules: value }),
      });
      if (!res.ok) throw new Error();
      const body = await res.json();
      setValue(body.planningRules);
      setSavedValue(body.planningRules);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus("idle");
        }}
        onBlur={() => {
          if (dirty) save();
        }}
        rows={9}
        style={{
          width: "100%",
          border: "1px solid #DCDCD5",
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.55,
          fontFamily: "inherit",
          outline: "none",
          resize: "vertical",
          background: "#FBFBF8",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => {
            setValue(defaultValue);
            setStatus("idle");
          }}
          style={{ background: "transparent", border: 0, fontSize: 11.5, fontWeight: 700, color: "#93938A", padding: 0 }}
        >
          Reset to default
        </button>
        <span style={{ flex: 1, minWidth: 0 }} />
        {status === "saving" && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#93938A" }}>Saving…</span>
        )}
        {status === "saved" && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#3D5C1B" }}>Saved ✓</span>
        )}
        {status === "error" && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#B3261E" }}>Couldn&apos;t save — try again</span>
        )}
        <button
          onClick={save}
          disabled={!dirty || status === "saving"}
          style={{
            background: "#14140F",
            color: "#FFFFFF",
            border: 0,
            borderRadius: 99,
            padding: "8px 16px",
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: ".04em",
            opacity: !dirty || status === "saving" ? 0.5 : 1,
          }}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}

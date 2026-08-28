"use client";

import type { KeyboardEvent } from "react";
import UrgencyChipRow from "./UrgencyChipRow";
import { UrgencyKey } from "@/lib/urgency";

interface SectionOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  text: string;
  urgency: UrgencyKey;
  custom: string;
  duration: string;
  sections: SectionOption[];
  selectedSectionId: string;
  onOpen: () => void;
  onCancel: () => void;
  onTextChange: (v: string) => void;
  onCustomChange: (v: string) => void;
  onDurationChange: (v: string) => void;
  onUrgencyChange: (k: UrgencyKey) => void;
  onSectionPick: (id: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

export default function QuickAddBox({
  open,
  text,
  urgency,
  custom,
  duration,
  sections,
  selectedSectionId,
  onOpen,
  onCancel,
  onTextChange,
  onCustomChange,
  onDurationChange,
  onUrgencyChange,
  onSectionPick,
  onKeyDown,
  onAdd,
}: Props) {
  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="mb-quickadd-rest"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "1px dashed #A9BA2E",
          borderRadius: 14,
          padding: "11px 12px",
          textAlign: "left",
          color: "#41470F",
          fontSize: 13.5,
          fontWeight: 700,
        }}
      >
        <span style={{ flex: "none", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>
        Add something for today
      </button>
    );
  }

  const filled = !!text.trim();

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "13px 13px 11px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <input
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
        placeholder="What needs doing?"
        style={{
          width: "100%",
          border: 0,
          outline: "none",
          background: "transparent",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "-.01em",
          padding: 1,
        }}
      />
      <div style={{ height: 1, background: "#EDEDE7" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", color: "#A3A39A" }}>
          WHICH LIST?
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {sections.map((s) => {
            const on = selectedSectionId === s.id;
            return (
              <button
                key={s.id}
                className="mb-chip"
                onClick={() => onSectionPick(s.id)}
                style={{
                  background: on ? "#14140F" : "#FFFFFF",
                  color: on ? "#FFFFFF" : "#93938A",
                  border: on ? "1px solid #14140F" : "1px solid #DFDFD8",
                  borderRadius: 99,
                  padding: "5px 11px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", color: "#A3A39A" }}>
          HOW URGENT?
        </span>
        <UrgencyChipRow value={urgency} onChange={onUrgencyChange} />
        {urgency === "Custom" && (
          <input
            value={custom}
            onChange={(e) => onCustomChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your own — e.g. before Sam visits"
            style={{
              width: "100%",
              border: "1px dashed #A9A99F",
              borderRadius: 10,
              padding: "7px 10px",
              fontSize: 12,
              fontWeight: 600,
              outline: "none",
              background: "#FBFBF8",
            }}
          />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", color: "#A3A39A" }}>
          HOW LONG? (OPTIONAL)
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            min={1}
            step={5}
            inputMode="numeric"
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. 20"
            style={{
              width: 84,
              border: "1px solid #DFDFD8",
              borderRadius: 10,
              padding: "7px 10px",
              fontSize: 12.5,
              fontWeight: 600,
              outline: "none",
              background: "#FFFFFF",
            }}
          />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#A3A39A" }}>minutes</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 600, color: "#B0B0A7" }}>
          Enter to add · Esc to close
        </span>
        <button
          onClick={onCancel}
          className="mb-cancel"
          style={{ background: "transparent", border: 0, color: "#93938A", fontSize: 11.5, fontWeight: 700, padding: "6px 4px" }}
        >
          Cancel
        </button>
        <button
          onClick={onAdd}
          className="mb-addbtn"
          style={{
            background: filled ? "#14140F" : "#E4E4DE",
            color: filled ? "#FFFFFF" : "#A3A39A",
            border: 0,
            borderRadius: 99,
            padding: "7px 15px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".05em",
          }}
        >
          ADD ↵
        </button>
      </div>
    </div>
  );
}

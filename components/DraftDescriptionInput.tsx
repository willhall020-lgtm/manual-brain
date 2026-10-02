"use client";

import { useLayoutEffect, useRef } from "react";

// The optional description field in both add boxes (QuickAddBox and
// TaskAddBox), sitting straight under the name like a second line of it.
// Controlled, unlike TaskDescription's commit-on-blur textarea, since it's
// part of the draft the add box already holds. Enter inserts a newline
// (notes can be multi-line), so ⌘/Ctrl+Enter is what adds from here; Esc
// closes the box, same as from the name field.

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export default function DraftDescriptionInput({ value, onChange, onAdd, onCancel }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Starts three lines tall (rows) and grows to fit the content rather
  // than scrolling inside a fixed box (capped, so a very long note
  // scrolls instead). +2 for the 1px border, since box-sizing is
  // border-box and scrollHeight excludes it. Keyed on value, not
  // onChange, so it also shrinks back when a successful add clears the
  // draft while the box stays open.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 240)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onAdd();
        }
        if (e.key === "Escape") onCancel();
      }}
      placeholder="Description (optional)"
      rows={3}
      style={{
        display: "block",
        width: "100%",
        resize: "none",
        border: "1px solid #EDEDE7",
        borderRadius: 10,
        outline: "none",
        background: "#FBFBF8",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.45,
        color: "#5C5C55",
        padding: "8px 10px",
      }}
    />
  );
}

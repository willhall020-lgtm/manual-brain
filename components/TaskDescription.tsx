"use client";

import { useState } from "react";

// A task's free-text notes, shown on their own line under the task row.
// Collapsed to a single clamped line by default; the ▾ beside it expands to
// the full text (and back). Clicking the text itself edits it, like every
// other field on the row. While the row is editing it becomes a textarea —
// same uncontrolled, commit-on-blur pattern as AssigneeInput, except Enter
// inserts a newline instead of committing, since notes can be multi-line.
//
// Lives inside the row's display:contents edit group (see ListTaskRow) so
// focus moving between the name input and this textarea doesn't close the
// edit; flexBasis 100% + order 1 push it onto its own line after every
// other item in the row, including the book/edit/delete buttons that sit
// outside the group.

interface Props {
  description: string | null;
  editing: boolean;
  onCommit: (description: string | null) => void;
}

export default function TaskDescription({ description, editing, onCommit }: Props) {
  const [expanded, setExpanded] = useState(false);
  // Set when the row's edit mode was opened by clicking this description,
  // so the textarea takes focus instead of the name input.
  const [focusOnEdit, setFocusOnEdit] = useState(false);

  // Grow the textarea to fit its content (wrapped lines included) rather
  // than guessing a row count — capped so a very long note scrolls instead.
  function fit(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 220)}px`;
  }

  function commit(raw: string) {
    const trimmed = raw.trim();
    const next = trimmed || null;
    if (next !== description) onCommit(next);
  }

  const lineStyle = {
    order: 1,
    flexBasis: "100%",
    minWidth: 0,
    paddingLeft: 31, // lines up under the task name, past the done button
  } as const;

  if (editing) {
    return (
      <div className="mb-taskrow-desc" style={lineStyle}>
        <textarea
          ref={fit}
          onInput={(e) => fit(e.currentTarget)}
          defaultValue={description ?? ""}
          // Both this and the name input autoFocus when edit mode opens;
          // this one mounts later, so it wins whenever it's set.
          autoFocus={focusOnEdit}
          onFocus={(e) => {
            const end = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(end, end);
          }}
          onBlur={(e) => {
            setFocusOnEdit(false);
            commit(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") e.currentTarget.blur();
          }}
          placeholder="Add a description…"
          rows={2}
          style={{
            display: "block",
            width: "100%",
            resize: "none",
            border: "1px solid #E0E0D9",
            borderRadius: 8,
            padding: "7px 9px",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.45,
            outline: "none",
            background: "#FBFBF8",
            color: "#3D3D36",
          }}
        />
      </div>
    );
  }

  if (!description) return null;

  return (
    <div
      className="mb-taskrow-desc"
      style={{ ...lineStyle, display: "flex", alignItems: "flex-start", gap: 6, color: "#7C7C73", fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}
    >
      <span
        // No handler of its own beyond the focus flag: the click bubbles up
        // to the row's tap-to-edit catch-all, same as the other fields.
        onClick={() => setFocusOnEdit(true)}
        style={{
          flex: 1,
          minWidth: 0,
          cursor: "pointer",
          whiteSpace: expanded ? "pre-wrap" : "normal",
          overflowWrap: "anywhere",
          ...(expanded
            ? {}
            : { display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }),
        }}
      >
        {description}
      </span>
      <button
        onClick={(e) => {
          // Stop the row's tap-to-edit catch-all from also firing — this
          // one means "show me more", not "edit this task".
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        title={expanded ? "Collapse description" : "Expand description"}
        aria-expanded={expanded}
        className="mb-iconbtn"
        style={{
          flex: "none",
          width: 22,
          height: 19,
          padding: 0,
          border: 0,
          borderRadius: 6,
          background: "transparent",
          color: "#B0B0A7",
          fontSize: 10,
          lineHeight: "19px",
        }}
      >
        <span
          aria-hidden
          style={{ display: "inline-block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .15s" }}
        >
          ▾
        </span>
      </button>
    </div>
  );
}

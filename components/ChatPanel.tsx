"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

interface DisplayMessage {
  role: "user" | "assistant";
  text: string;
  notes: string[];
}

const TOOL_NOTES: Record<string, string> = {
  list_tasks: "Checked your tasks",
  add_task: "Added a task",
  schedule_task: "Booked an event",
  mark_task_done: "Marked a task done",
};

export default function ChatPanel() {
  const [apiMessages, setApiMessages] = useState<MessageParam[]>([]);
  const [display, setDisplay] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);

    const newApiMessages: MessageParam[] = [...apiMessages, { role: "user", content: text }];
    setApiMessages(newApiMessages);
    setDisplay((prev) => [...prev, { role: "user", text, notes: [] }]);
    setSending(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newApiMessages }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Chat request failed.");

      const returned: MessageParam[] = body.messages;
      const appended = returned.slice(newApiMessages.length);

      let text = "";
      const notes: string[] = [];
      for (const m of appended) {
        if (m.role !== "assistant") continue;
        const blocks = Array.isArray(m.content) ? m.content : [];
        for (const b of blocks as Anthropic.ContentBlock[]) {
          if (b.type === "text") text += (text ? "\n" : "") + b.text;
          if (b.type === "tool_use") notes.push(TOOL_NOTES[b.name] || `Used ${b.name}`);
        }
      }

      setApiMessages(returned);
      setDisplay((prev) => [
        ...prev,
        { role: "assistant", text: text || "(no response)", notes },
      ]);
      if (body.error) setError(body.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat request failed.");
    } finally {
      setSending(false);
      scrollToBottom();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#FBFBF9",
        border: "1px solid #EDEDE7",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {display.length === 0 && (
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "#93938A", lineHeight: 1.5 }}>
            Ask what&apos;s outstanding, add a task to a list, tell it what to schedule today, or
            say a task&apos;s done. It can see your task list and book onto your Google Calendar.
          </div>
        )}
        {display.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "82%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                background: m.role === "user" ? "#14140F" : "#F3F3EF",
                color: m.role === "user" ? "#FFFFFF" : "#14140F",
                borderRadius: 16,
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.45,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
            {m.notes.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 4 }}>
                {m.notes.map((n, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: ".03em",
                      color: "#7E8A16",
                      background: "#F2F6DC",
                      borderRadius: 99,
                      padding: "3px 9px",
                    }}
                  >
                    {n.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div style={{ alignSelf: "flex-start", fontSize: 12.5, fontWeight: 600, color: "#93938A" }}>
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: "0 20px 8px", fontSize: 12.5, fontWeight: 600, color: "#B3261E" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid #EDEDE7" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message…"
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid #DCDCD5",
            borderRadius: 14,
            padding: "10px 12px",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            background: "#14140F",
            color: "#FFFFFF",
            border: 0,
            borderRadius: 14,
            padding: "0 18px",
            fontSize: 12.5,
            fontWeight: 800,
            letterSpacing: ".04em",
            opacity: sending || !input.trim() ? 0.5 : 1,
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}

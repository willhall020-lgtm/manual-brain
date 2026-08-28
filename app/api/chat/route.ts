import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { CHAT_TOOLS, runChatTool } from "@/lib/chat-tools";

// Manual tool-use loop (not the beta tool runner — this is a single
// serverless request/response, no need for the extra dependency). The
// client resends the full message history each turn and gets it back
// with this turn's assistant + tool_result blocks appended, per the
// stateless pattern the Messages API expects.

export const dynamic = "force-dynamic";

const MAX_ITERATIONS = 8;

function systemPrompt(): string {
  const nowUTC = new Date().toISOString();
  return `You are the scheduling assistant inside Manual Brain, a personal task tracker. Your job is the same one a Slack routine used to do: look at what's outstanding, decide what should happen today, and book it onto the user's Google Calendar — without making the user do the busywork of picking times themselves.

Current time (UTC): ${nowUTC}. The user hasn't told you their timezone — infer it from context if they mention a time, or ask once if it's genuinely ambiguous, then remember it for the rest of this conversation.

Guidelines:
- Call list_tasks before making any claim about what's outstanding — don't guess from earlier in the conversation, task state can change.
- When the user wants something scheduled, just book it with schedule_task and tell them what you booked — don't ask for permission on every single task, that defeats the point of this tool. Do check with them on genuinely ambiguous timing (e.g. no time given for a same-day multi-slot task).
- Only call mark_task_done when the user says a task is actually finished. Scheduling a task is not finishing it.
- Keep replies short and conversational — this is a quick daily check-in, not a report.`;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const incoming = Array.isArray(body?.messages) ? (body.messages as MessageParam[]) : null;
  if (!incoming || incoming.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const client = new Anthropic();
  const messages: MessageParam[] = [...incoming];

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 4096,
        system: systemPrompt(),
        tools: CHAT_TOOLS,
        messages,
      });

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        return NextResponse.json({ messages });
      }

      const toolUses = response.content.filter(
        (b): b is ToolUseBlock => b.type === "tool_use"
      );
      const results: ToolResultBlockParam[] = [];
      for (const tool of toolUses) {
        let content: string;
        try {
          content = await runChatTool(tool.name, tool.input);
        } catch (err) {
          content = JSON.stringify({
            error: err instanceof Error ? err.message : "Tool call failed.",
          });
        }
        results.push({ type: "tool_result", tool_use_id: tool.id, content });
      }
      messages.push({ role: "user", content: results });
    }

    return NextResponse.json({
      messages,
      error: "Hit the tool-call loop limit — try asking a more specific question.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat request failed." },
      { status: 500 }
    );
  }
}

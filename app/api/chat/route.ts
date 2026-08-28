import { NextResponse } from "next/server";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { runChatLoop } from "@/lib/chat-loop";

// Thin HTTP wrapper — the loop itself lives in lib/chat-loop.ts, shared
// with the unattended morning cron. The client resends the full message
// history each turn and gets it back with this turn's assistant +
// tool_result blocks appended, per the stateless pattern the Messages API
// expects.

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const incoming = Array.isArray(body?.messages) ? (body.messages as MessageParam[]) : null;
  if (!incoming || incoming.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  try {
    const result = await runChatLoop(incoming);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat request failed." },
      { status: 500 }
    );
  }
}

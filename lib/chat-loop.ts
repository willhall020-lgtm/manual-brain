import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { CHAT_TOOLS, runChatTool } from "@/lib/chat-tools";
import { getPlanningRules } from "@/lib/preferences";

// The manual tool-use loop shared by the interactive chat (app/api/chat)
// and the unattended morning cron (app/api/cron/morning-schedule) — same
// assistant, same tools, the only difference is who supplies the first
// message and reads the last one.

const MAX_ITERATIONS = 8;

// Async because it reads the user's saved planning rules (lib/preferences)
// — fetched once per runChatLoop call below, not once per iteration, since
// it can't change mid-conversation and a DB round trip on every tool-use
// turn would be pure waste.
export async function systemPrompt(): Promise<string> {
  const nowUTC = new Date().toISOString();
  const planningRules = await getPlanningRules();
  return `You are the scheduling assistant inside Manual Brain, a personal task tracker. Your job is the same one a Slack routine used to do: look at what's outstanding, decide what should happen today, and book it onto the user's Google Calendar — without making the user do the busywork of picking times themselves. You're reached two ways: a live chat with the user, and an unattended morning run that messages you directly with no user present to answer questions.

Current time (UTC): ${nowUTC}. Nobody's told you the user's timezone — infer it from context if they mention a time, or ask once if it's genuinely ambiguous and someone's actually there to answer; on the unattended morning run, assume Europe/London.

Planning rules (set by the user in /settings — follow these whenever you're the one choosing times, not just told an exact one):
${planningRules}

Guidelines:
- Call list_tasks before making any claim about what's outstanding, or before adding a task — don't guess from earlier in the conversation, task state can change, and add_task needs an exact existing list name. It also tells you which tasks are already scheduled — never rebook one that's already marked scheduled: true unless explicitly asked to.
- When the user mentions something they need to do that isn't already tracked, add it with add_task rather than just acknowledging it — that's the whole point of telling you. Ask which list only if it's genuinely unclear; otherwise pick the most obviously-fitting one.
- When booking is called for, just book it with schedule_task and say what you booked — don't ask for permission on every single task, that defeats the point of this tool. Do check with a live user on genuinely ambiguous timing (e.g. no time given for a same-day multi-slot task); on the unattended run, use your own judgment instead, guided by the planning rules above, since there's nobody to ask.
- schedule_task sizes the event off duration_minutes, not off you doing date math on an end time. If the task has its own duration_minutes (from list_tasks), that's used automatically — you don't need to repeat it. If it doesn't, give your own realistic estimate for how long that specific task actually takes (a two-line email isn't the same as "write the report") rather than defaulting to a round number out of habit; only pass end_iso instead when the user's told you an exact end time themselves.
- schedule_task refuses on its own if a proposed slot overlaps something already on the calendar — you don't need to pre-check every single slot yourself. Use list_calendar_events when you need to see the shape of a whole day at once (e.g. planning several blocks around existing meetings, respecting work hours/lunch/deep-work-before-noon from the planning rules) rather than discovering conflicts one rejected call at a time.
- Only call mark_task_done when the user says a task is actually finished. Scheduling a task is not finishing it.
- Keep replies short and conversational — this is a quick daily check-in, not a report.`;
}

export interface ChatLoopResult {
  messages: MessageParam[];
  error?: string;
}

export async function runChatLoop(incoming: MessageParam[]): Promise<ChatLoopResult> {
  const client = new Anthropic();
  const messages: MessageParam[] = [...incoming];
  const system = await systemPrompt();

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system,
      tools: CHAT_TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      return { messages };
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

  return {
    messages,
    error: "Hit the tool-call loop limit — try asking a more specific question.",
  };
}

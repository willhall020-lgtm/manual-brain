// The chat tab's brain. Calls Claude when the host provides it, and falls
// back to a canned reply so the kit still demos offline.
const SUGGESTIONS = ["what should i start with?", "what's slipping?", "clear my today"];

function buildSystem(tasks, sections, dateLabel) {
  const name = (id) => (sections.find((s) => s.id === id) || {}).name || "";
  const lines = tasks
    .filter((t) => !t.doneAt)
    .map((t) => "- " + t.name + " [" + name(t.sectionId) + "] urgency: " + (t.urgency === "Custom" ? t.customLabel : t.urgency))
    .join("\n");
  return [
    "You are Manual Brain, a task assistant for someone with ADHD. Today is " + dateLabel + ".",
    "Voice: calm, plain, permission-giving. Contractions. No emoji, no exclamation marks, no praise, no productivity jargon.",
    "Write EVERYTHING in lowercase — including the first word of a sentence and proper nouns. Never capitalise anything.",
    "Be short — two or three sentences, or a tight list. Name one concrete next action rather than a plan.",
    "Urgency can only be: Today, 2–3 days, End of this week, This month, or a custom label. There are no calendar dates.",
    "",
    "Their open tasks:",
    lines || "(nothing open)",
  ].join("\n");
}

async function askBrain({ text, history, tasks, sections, dateLabel }) {
  const system = buildSystem(tasks, sections, dateLabel);
  const messages = [...history, { role: "user", content: text }].map((m) => ({ role: m.role, content: m.content }));
  if (window.claude && window.claude.complete) {
    try {
      return await window.claude.complete({ system, messages, max_tokens: 400 });
    } catch (e) {
      return "couldn't reach the model just now — try again in a moment.";
    }
  }
  const today = tasks.filter((t) => !t.doneAt && t.urgency === "Today");
  if (!today.length) return "nothing's marked for today, so nothing's urgent. pick one thing off a list if you want a start.";
  return "start with " + today[0].name.toLowerCase() + ". it's first in today and small enough to finish. the other " + (today.length - 1) + " can wait.";
}

Object.assign(window, { SUGGESTIONS, askBrain });

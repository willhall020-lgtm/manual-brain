# Manual Brain — Spec

## MVP — shipped

| Feature | Requirements | Status |
| --- | --- | --- |
| Task separation | • ability to separate tasks between Deloitte work, personal projects, and life admin<br>• ability to add new sections if needed | ✅ Done. Sections table + "+ Add a list". Also got list **rename** (click the title on a list's detail screen) and list **delete** (with a confirm prompt, cascades its tasks) — not originally asked for, built alongside. |
| Add tasks | • ability to add, remove, and edit tasks to each section<br>• ability to add urgency of tasks - not by due date but by relative urgency:<br>&nbsp;&nbsp;- today<br>&nbsp;&nbsp;- 2-3 days<br>&nbsp;&nbsp;- end of this week<br>&nbsp;&nbsp;- this month<br>&nbsp;&nbsp;- custom | ✅ Done. All five urgency levels, add/edit/delete per task. The chat can now add tasks too (tell it something's outstanding and it files it, asking which list only if that's unclear). |
| Sync with my claude/slack/gcal tool | • tool needs to feed tasks into the claude routine on slack<br>• the claude routine will pick up the tasks and assign ones that should be scheduled today - then schedule them in gcal<br>• the tool should have a gcal integration and show my gcal as a window in the site | ✅ Done — further than originally scoped, see below. |
| Finish tasks | • ability to mark tasks as done, and add them to the done list | ✅ Done. Done list with undo, plus **delete a done task** directly from that panel (added beyond the original ask). |

### Sync — what actually shipped

Originally scoped as: push tasks into a Slack channel → a Claude routine there decides what's for today and books gcal.

What's live instead — this absorbs V1's "move Slack to the site" + "chat feature" rows below, they landed as part of MVP rather than after it:

- **In-site chat**, a permanent box on the dashboard (below "for today") — a real Claude tool-use loop, not a Slack channel. It can list what's outstanding, add new tasks it hears about, book things onto the calendar, and mark tasks done, all from conversation.
- **Google Calendar**: the read-only sidebar (private iCal feed, today + tomorrow) is still there as originally asked, *and* there's now real write access (Google OAuth, connected from `/settings`) — the chat books actual events, this isn't just a preview window.
- **Password gate** (one shared site password) — not in the original spec at all, added because the chat spends real API budget and can write to the calendar, so the site needed to stop being open to anyone with the link first.

## V1

| Feature | Requirements | Status |
| --- | --- | --- |
| Move the Slack channel to the site + chat feature | | ✅ Done — landed early, folded into MVP's sync row above. |
| Email integration | | ⬜ Not started — no scope defined yet. |

## Built along the way, not in either list above

- 🧠 favicon.
- Font: Archivo → Manrope; a few copy tweaks on the home screen.

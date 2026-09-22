# UI kit — Manual Brain dashboard (web)

Recreation of the only surface Manual Brain currently has: a single-page
dashboard at `/`. Built from `willhall020-lgtm/manual-brain`
(`app/page.tsx`, `components/Dashboard.tsx` and its children), not from
screenshots.

| File | What it is |
| --- | --- |
| `index.html` | The clickable kit. Loads `styles.css` + `_ds_bundle.js`, then the screens. |
| `App.jsx` | All state: view switching, drafts, edit/done/delete, done panel, calendar wiring. Mirrors `Dashboard.tsx`. |
| `HomeScreen.jsx` | Lime "for today" block + quick add + the list-card grid. |
| `ListScreen.jsx` | One list: back button, heading, rows with urgency pills, add box. |
| `seed.jsx` | Fake starter content (four lists, seventeen tasks, a day of calendar events). |

## What works in the kit

- Home ⇄ list navigation (one level deep, exactly as in the app).
- Quick add from the lime block: pick a list, pick an urgency, Enter to add, Esc to close.
- Add a task inside a list; add a list from the dashed ghost tile.
- Mark done (task moves into the collapsed Done panel) and undo.
- Inline rename on any row; delete; change urgency from the pill dropdown.
- The Done panel toggles; the calendar sidebar is read-only by design.

## Deliberately absent

Per the upstream brief: no live Google Calendar connection, no Slack, no
in-app chat, no email, and no way to delete a list. The newer settings /
log-out / chat / booking affordances visible in the user's screenshots are
not in the repository yet — see the root `readme.md` "Known gaps".

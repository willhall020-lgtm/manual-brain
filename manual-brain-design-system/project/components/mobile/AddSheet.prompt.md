`QuickAddBox` as a bottom sheet, extended with the scheduling fields from the newer build: title, which list, how urgent, due date, how long, when, repeats.

```jsx
<AddSheet open={adding} text={draft.text} urgency={draft.urgency} due={draft.due}
  minutes={draft.minutes} when={draft.when} repeat={draft.repeat} sections={sections}
  selectedSectionId={sec} onAdd={add} onClose={close} />
```

The body scrolls inside a fixed 86% sheet so the commit row stays pinned. Duration chips toggle off when re-tapped (duration is optional); `when` and `repeat` always have a value, defaulting to "any time" and "never". The commit button is a full-width 46px pill reading **add task**, grey until there's text.

**Provenance:** urgency and list come from the repo; due date, duration, when and repeat come from the project screenshots and are design intent ahead of the schema.

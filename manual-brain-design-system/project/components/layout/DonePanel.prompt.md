Finished work, collapsed by default — a sunken grey panel whose header is the toggle.

```jsx
<DonePanel items={done} open={open} onToggle={toggle} onUndo={undo} />
```

Collapsed is the resting state: the point is that completed work stops competing for attention. Toggle copy is "show ▼" / "hide ▲" in eyebrow type. Empty copy is reassuring, not nagging.

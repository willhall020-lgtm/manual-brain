The "how urgent?" picker — all five relative labels in a wrapping row, each showing its own colour when selected.

```jsx
<UrgencyChipRow value={draft.urgency} onChange={(k) => setDraft({ urgency: k })} />
```

Shared by both add boxes. Unselected chips are white/grey; the selected chip takes the urgency's own bg/fg/border. Picking "Custom" is what reveals the free-text label input.

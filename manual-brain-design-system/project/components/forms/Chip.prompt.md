The single-select pill used by the "which list?" picker inside the quick-add box.

```jsx
<Chip label="Life admin" selected={id === active} onClick={() => pick(id)} />
```

Unselected is white with a grey border and grey text; selected is solid ink. Hover drops opacity to .85. For urgency use `UrgencyChipRow`, which carries each label's own colour.

On mobile pass `size="touch"` — same shape, 44px tall.

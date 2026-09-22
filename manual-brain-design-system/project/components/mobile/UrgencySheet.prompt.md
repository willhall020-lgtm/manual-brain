`UrgencyMenu` as a sheet — 48px rows so the five relative labels are tappable.

```jsx
<UrgencySheet open={!!urgencyFor} value={task.urgency} onPick={setUrgency} onClose={close} />
```

Same fixed five options, same order, same colour dots. The current value is marked with a blue ✓ and a `--mb-n-100` fill. No "clear" or "custom date" option exists.

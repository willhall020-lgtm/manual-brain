The add box inside a single list view — no list picker (the list is implied), grey-dashed when closed, ink-bordered with a soft shadow when open.

```jsx
<TaskAddBox open={open} text={draft.text} urgency={draft.urgency} onOpen={open} onAdd={add} onCancel={close} />
```

Always the last child of the list container. Same keyboard contract as `QuickAddBox`: Enter adds, Esc closes.

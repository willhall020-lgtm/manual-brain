The add affordance that sits at the bottom of the lime "for today" block — closed it is a lime-dashed "+ Add something for today" strip; open it becomes a white card with list and urgency pickers.

```jsx
<QuickAddBox open={open} text={draft.text} urgency={draft.urgency} sections={sections}
  selectedSectionId={quickSection} onOpen={open} onAdd={add} onCancel={close} />
```

Only one add box is open anywhere at a time. Keyboard is first-class: Enter adds, Esc closes, and the hint line says so. Inside a list view use `TaskAddBox` instead (no list picker, ink border, shadow).

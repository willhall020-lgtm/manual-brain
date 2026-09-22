A finished task inside the Done panel — struck through, greyed, with a blue tick and an undo arrow.

```jsx
<DoneTaskRow name="Book dentist" sectionName="Life admin" onUndo={() => undo(t.id)} />
```

The tick is the only filled blue circle in the product. Undo is always available; done tasks are never deleted from this row.

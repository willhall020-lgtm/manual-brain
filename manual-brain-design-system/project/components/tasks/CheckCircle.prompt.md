The empty ring that marks a task done — the only checkbox in Manual Brain, and it is never pre-checked (done tasks move to the Done panel instead).

```jsx
<CheckCircle size={21} onClick={() => markDone(task.id)} />
```

Hover turns the ring blue and fills it with the blue tint. Use 21px in the "for today" block, 20px in list views.

On touch surfaces pass `hit`: the ring keeps its size but becomes a 44px target, with negative margin cancelling the extra so row layout doesn't move.

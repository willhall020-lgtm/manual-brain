The phone task row — same anatomy as the web rows, restacked for thumbs: 56px min height, a 24px check ring, the list name under the title, and a second meta line for scheduling.

```jsx
<MobileTaskRow name="founders factory application" sectionName="applications"
  due="31 aug" overdue minutes={40} when="any time" booked
  onPress={openSheet} onDone={done} />
<MobileTaskRow name="renew passport" urgency="End of this week" variant="list" onPressUrgency={openSheet} />
```

The meta line only renders when there's something to put on it, so a bare task stays a single line.

**The whole card is the edit target.** `onPress` sits on the row container — not on the title — so any dead space, the meta line and the padding all open the task sheet, and the target is the full 56px+ row rather than a 35px text box. Every control inside the row (`CheckCircle`, `UrgencyPill`, `BookButton`, delete) stops propagation, so tapping those does its own thing without also opening the sheet. If you add another control, wrap its handler the same way or it will fire twice.

**There is no delete on the row, and no inline edit glyph.** Both live in the task sheet. Deleting a task can't be undone (only *done* can, from the Done panel), so a destructive control does not belong one thumb-width from the urgency pill on a 393pt row — the mis-tap cost is losing the task. Renaming and deleting are both one tap away in the sheet, behind a deliberate press.

The scheduling metadata that sits between a task's title and its row actions: due date, estimated duration, time of day, repeat, and the calendar-booking button.

```jsx
<TaskMeta due="31 aug" overdue minutes={40} when="any time" booked onBook={unbook} />
```

`TaskMeta` renders the whole run in canonical order and returns `null` when there's nothing to show, so a bare task stays one line. The pieces are also exported individually when you need to place them yourself:

```jsx
<DueLabel due="31 aug" overdue />
<DurationLabel minutes={40} />
<WhenLabel when="afternoon" />
<RepeatLabel repeat="weekly" />
<BookButton booked onClick={unbook} />
```

Read left to right they get quieter: overdue is red + bold, due and duration are `--text-muted`, time of day is `--text-faint`. `BookButton` is the one call to action on a row — solid ink as **book**, pale lime as **booked**.

**Provenance:** these come from the newer build shown in the project screenshots, not from the repo (whose `Task` has no date, duration or repeat fields). `repeat` appears in neither and its control is invented — verify before relying on it.

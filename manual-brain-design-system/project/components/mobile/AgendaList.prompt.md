`CalendarPanel` restacked for the phone — same rows, same lime NOW rule, no fixed 326px column.

```jsx
<AgendaList before={cal.before} after={cal.after} />
<AgendaList before={cal.tomorrow} showNow={false} label="tomorrow's calendar" />
```

Sits at the bottom of the Today tab, under the tasks — the day's shape is context, not the main event. Pass `showNow={false}` for any day but today. Read-only, always, and it says so.

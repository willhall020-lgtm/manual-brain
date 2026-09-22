The 326px sticky sidebar showing today's shape next to the task list — read-only by design, and honest about it ("google · read only").

```jsx
<CalendarPanel todayLabel="today · tue 1" tomorrowLabel="tomorrow · wed 2"
  before={[{ time: "09:30", title: "Daily standup", meta: "15 min · Meet", barColor: "#2B34EE" }]}
  after={[{ time: "15:00", title: "1:1 with Marcus", meta: "30 min", barColor: "#C6C9FA" }]} />
```

The lime NOW rule is the only divider that carries colour. Past-of-day events use solid blue bars, later ones the soft blue, tomorrow dim grey. Never add editing affordances here.

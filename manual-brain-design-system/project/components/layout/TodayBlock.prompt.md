The lime container that holds only today's tasks — the single loudest surface in Manual Brain, and the reason the rest of the UI stays quiet.

```jsx
<TodayBlock count={todayTasks.length}>
  {todayTasks.map((t) => <TodayTaskRow key={t.id} {...t} />)}
  <QuickAddBox open={open} sections={sections} onOpen={openQuickAdd} />
</TodayBlock>
```

Use exactly one per screen, at the very top of the column. The lime (`#D6EC3C`) appears nowhere else at full size — everywhere else it is a small pill. Empty state reads "Nothing marked for today. That's allowed."

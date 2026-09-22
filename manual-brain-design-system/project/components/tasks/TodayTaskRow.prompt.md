The white task row used only inside the lime "for today" block — borderless (the lime does the containing) and tagged with its list name instead of an urgency pill.

```jsx
<TodayTaskRow name="Founders factory application" sectionName="Applications" onDone={done} onEdit={edit} onDelete={del} />
```

Set `editing` to swap the title for an inline input with a 2px blue underline. Rows stack with a 7px gap. Inside a list view use `ListTaskRow` instead — it has a border and an urgency pill.

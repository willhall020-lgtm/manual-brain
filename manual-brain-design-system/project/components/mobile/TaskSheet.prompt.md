The task detail sheet — the phone's answer to the web rows' `✎` glyph, which is too small a target for a thumb. Tapping a task row anywhere on its title opens it.

```jsx
<TaskSheet open={!!editing} task={editing} sections={sections}
  onChange={(p) => setEditing({ ...editing, ...p })}
  onSave={save} onDelete={del} onDone={done} onClose={close} />
```

Same field set as `AddSheet` (which it imports `DURATIONS`/`WHENS`/`REPEATS` from, so the option lists can't drift), plus three things only an existing task needs: a "mark it done" row at the top, a red "delete this task" text button at the bottom of the scroll, and **save** instead of **add task**. Destructive and completing actions sit apart from the commit row on purpose — nothing dangerous is adjacent to the primary button.

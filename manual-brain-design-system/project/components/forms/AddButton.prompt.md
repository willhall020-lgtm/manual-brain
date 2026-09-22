The commit button on add boxes — the closest thing Manual Brain has to a primary button.

```jsx
<AddButton filled={!!text.trim()} onClick={add} />
<AddButton label="create list" filled onClick={createList} />
```

It is grey and dead-looking until there is text, then ink-black. Labels are always lowercase, 800 weight, .05em tracking. Hover just drops opacity to .88.

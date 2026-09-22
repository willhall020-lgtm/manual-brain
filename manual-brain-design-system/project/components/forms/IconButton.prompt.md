A transparent 25px square that holds one unicode glyph — the only icon affordance in Manual Brain.

```jsx
<IconButton glyph="✎" title="Edit" onClick={edit} />
<IconButton glyph="✕" title="Delete" tone="danger" onClick={del} />
```

Rest colour is `--icon-rest`; hover fills the square with `--mb-n-200` and darkens the glyph (red for `tone="danger"`). Never substitute an SVG icon set — the glyph set is deliberate.

On touch surfaces pass `hit` to get a 44px target around the same painted square.

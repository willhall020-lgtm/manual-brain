The chat input docked above the tab bar: a pill field and a 46px send button.

```jsx
<ChatComposer value={draft} busy={thinking} onChange={setDraft} onSend={send} />
```

The send button follows the same rule as `AddButton` — grey and inert until there's text, then ink. The glyph is `↑`, added to the system's unicode set for this surface. Enter sends.

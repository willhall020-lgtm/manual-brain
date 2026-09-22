Dashed starter prompts shown in the chat tab's empty state — the same dashed-ghost language as the add strips, so they read as "not yet filled in".

```jsx
<SuggestionChips items={["what should I start with?", "what's slipping?"]} onPick={send} />
```

Write them in the user's voice, lowercase, as questions. Three or four maximum, and hide them once the conversation starts.

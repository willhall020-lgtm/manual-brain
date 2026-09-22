One turn in the chat tab — the user's side is solid ink, the assistant's side is a white bordered card.

```jsx
<ChatBubble from="me">what should I start with?</ChatBubble>
<ChatBubble from="brain">Founders factory application. It's the only Today task with a deadline attached.</ChatBubble>
```

Corner treatment is the tell: 16px radius everywhere except the corner nearest its owner, which drops to 5px. No avatars, no names, no timestamps — the alignment says who's talking.

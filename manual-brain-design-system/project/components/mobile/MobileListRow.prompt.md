`ListCard` unwrapped into a full-width row — the phone has no room for a 232px card grid.

```jsx
<MobileListRow name="personal projects" taskCount={17} dueCount={1} onClick={openList} />
```

Keeps the card's 20px radius, 1px border and count pills; drops the hover lift (there's no hover on a phone). Zero counts render nothing — never "0 due". Use `dueCount` when tasks carry real dates and `todayCount`/`soonCount` for the repo's urgency-only model; don't show all three at once.

The home screen's list tile — big 800-weight name, an arrow, and counts pinned to the bottom.

```jsx
<ListCard name="Life admin" taskCount={5} todayCount={1} soonCount={2} onClick={openList} />
```

Laid out in a `repeat(auto-fill, minmax(232px, 1fr))` grid with a 14px gutter, min-height 126px. Hover darkens the border to ink and lifts the card 2px — the only transform in the product. Count pills are omitted entirely at zero, never shown as "0".

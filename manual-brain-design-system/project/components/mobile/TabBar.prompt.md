The bottom tab bar — text only, because Manual Brain has no icon set to draw tabs from.

```jsx
<TabBar
  tabs={[
    { id: "chat", label: "chat" },
    { id: "today", label: "today" },
    { id: "tomorrow", label: "tomorrow" },
    { id: "lists", label: "lists" },
    { id: "settings", label: "settings", glyph: "⚙︎" },
  ]}
  active={tab}
  onSelect={setTab}
/>
```

Active tab is ink text with a 20×2px lime underline; inactive is `--mb-g-850` (#6E6E67, 5.14:1 on white — the lightest greige that clears AA at 10px, so don't reach for `--mb-g-800` or `--text-faint` here). Rows are 46px tall — compact, but still above the 44px touch floor, which is the floor for how short this bar can get. The bar sits above the home indicator.

**Word labels for the day-to-day tabs, a glyph only for utility.** Passing `glyph` swaps the word for a unicode character and takes the tab out of the equal-width flex, giving it a fixed 46px so the named tabs keep the room. Use it sparingly — one utility tab at the end. The glyph must carry the variation selector U+FE0E (`"⚙︎"`, not `"⚙"`) or it renders as a colour emoji, which the brand forbids; `label` is still required and becomes the `aria-label` and tooltip.

Four word tabs plus one glyph tab is the comfortable ceiling at 393pt. Beyond that, put it behind settings.

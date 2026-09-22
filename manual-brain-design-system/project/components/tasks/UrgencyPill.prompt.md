The colour-coded urgency label on a task row — use it wherever a task's relative due-ness is shown, and never build a date badge instead.

```jsx
<UrgencyPill urgency="2–3 days" onClick={openMenu} />
<UrgencyPill urgency="Custom" customLabel="before Sam visits" />
<UrgencyPill urgency="Today" display="dot" />
```

Only five values exist: Today (blue, solid), 2–3 days (lime), End of this week (blue tint), This month (grey), Custom (white + dashed border). `display="dot"` is the compact variant used inside dense list views. Hover drops opacity to .82.

**Always pass `hit` on a phone.** The painted pill is ~25px tall and the dot only 13px — far below the 44px floor. `hit` keeps those exact visuals inside a 44px pressable box (the dot also gets 44px of width), with negative margin so rows stay compact. The dot is a mouse affordance by origin; without `hit` it is unusable by thumb.

The task row used inside a single list view — white on the sunken grey list container, with a 1px border and an urgency pill that opens the urgency menu.

```jsx
<ListTaskRow name="Renew passport" urgency="End of this week" menuOpen={open} onToggleMenu={toggle} onPickUrgency={setUrgency} />
```

Keep the wrapping element's `.mb-menu-anchor` class — outside-click closing depends on it. Rows stack with an 8px gap inside the list container.

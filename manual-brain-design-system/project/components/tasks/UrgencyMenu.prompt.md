The 186px dropdown that changes a task's urgency — the only popover in the product, and the only place `--shadow-menu` is used.

```jsx
<div className="mb-menu-anchor" style={{ position: "relative" }}>
  <UrgencyPill urgency={t.urgency} onClick={toggle} />
  {open && <UrgencyMenu onPick={(k) => setUrgency(t.id, k)} />}
</div>
```

Always all five options, always in fixed order, each with a 10px colour dot. It must be absolutely positioned inside a `position: relative` parent carrying `.mb-menu-anchor`.

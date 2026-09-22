The bottom sheet — mobile's stand-in for the web's inline add box and urgency dropdown. The only overlay in the whole system.

```jsx
<Sheet open={open} title="NEW TASK" onClose={close}>…</Sheet>
```

22px top corners, a grab handle, and a `rgba(20,20,15,.28)` scrim (the one place Manual Brain uses transparency — the web product has no overlays at all). Tapping the scrim closes. Never stack two sheets.

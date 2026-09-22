A single setting on the settings tab: label, a sentence explaining it, and its control underneath.

```jsx
<SettingsRow label="urgency labels" description="show the full label, or just a colour dot.">
  <Chip label="pill" size="touch" selected={d === "pill"} onClick={() => set("pill")} />
  <Chip label="dot" size="touch" selected={d === "dot"} onClick={() => set("dot")} />
</SettingsRow>

<SettingsRow label="calendar" value="google · read only"
  description="manual brain can see your day but never writes to it." />
```

Controls are **pairs of `Chip`s**, not switches — Manual Brain has no switch primitive and doesn't need one; a chip pair names both states, which reads better than an unlabelled toggle. Use `value` with no children for a read-only row. Descriptions are full lowercase sentences that say what changes, never "enable/disable".

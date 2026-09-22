The outline pill that returns from a list view to the home screen.

```jsx
<BackButton onClick={() => setView("home")} />
```

Navigation in Manual Brain is one level deep — home ⇄ one list — so this is the only back affordance. The ← is a unicode glyph, not an icon.

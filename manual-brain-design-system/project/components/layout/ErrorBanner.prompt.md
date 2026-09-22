The only error surface in the product — a dismissible red-tint strip under the header. There are no toasts and no modals.

```jsx
{error && <ErrorBanner message="Couldn't save that task — try again." onDismiss={clear} />}
```

The whole banner is the dismiss target and says so. Messages use contractions, name the action that failed, and never blame the user.

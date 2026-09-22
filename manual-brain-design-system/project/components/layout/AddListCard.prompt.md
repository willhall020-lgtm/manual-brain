The dashed ghost tile at the end of the list grid, which becomes an inline name field.

```jsx
<AddListCard adding={adding} value={name} onOpen={start} onChange={setName} onCreate={create} />
```

Same 126px min-height and 20px radius as `ListCard` so the grid stays even. Lists can be created but never deleted — that's deliberate, so don't add a delete affordance.

const { BackButton, ListTaskRow, TaskAddBox } = window.ManualBrainDesignSystem_41bc1a;

function ListScreen({ section, tasks, onBack, row, addBox }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <BackButton onClick={onBack} />
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.03em", textTransform: "lowercase" }}>{section.name}</h2>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#93938A" }}>
          {tasks.length === 1 ? "1 task" : tasks.length + " tasks"}
        </span>
      </div>

      <div style={{ background: "#EEEEEA", borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map((t) => (
          <ListTaskRow
            key={t.id}
            name={t.name}
            urgency={t.urgency}
            customLabel={t.customLabel}
            editing={row.editing === t.id}
            editVal={row.editVal}
            menuOpen={row.menuFor === t.id}
            onDone={() => row.onDone(t.id)}
            onEdit={() => row.onEdit(t.id, t.name)}
            onDelete={() => row.onDelete(t.id)}
            onEditChange={row.onEditChange}
            onEditKeyDown={row.onEditKeyDown}
            onEditBlur={row.onEditBlur}
            onToggleMenu={() => row.onToggleMenu(t.id)}
            onPickUrgency={(k) => row.onPickUrgency(t.id, k)}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{ padding: 14, border: "1px dashed #D6D6CE", borderRadius: 14, fontSize: 13.5, fontWeight: 600, color: "#A3A39A" }}>
            this list is empty. nice.
          </div>
        )}
        <div style={{ marginTop: 2 }}><TaskAddBox {...addBox} /></div>
      </div>
    </div>
  );
}

Object.assign(window, { ListScreen });

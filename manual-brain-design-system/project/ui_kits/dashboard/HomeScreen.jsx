const { Eyebrow, TodayBlock, TodayTaskRow, QuickAddBox, ListCard, AddListCard, SOON_KEYS } = window.ManualBrainDesignSystem_41bc1a;

function HomeScreen({ sections, tasks, sectionName, quickAdd, onOpenList, addList }) {
  const active = tasks.filter((t) => !t.doneAt);
  const todayTasks = active.filter((t) => t.urgency === "Today");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <TodayBlock count={todayTasks.length}>
        {todayTasks.map((t) => (
          <TodayTaskRow
            key={t.id}
            name={t.name}
            sectionName={sectionName(t.sectionId)}
            editing={quickAdd.editing === t.id}
            editVal={quickAdd.editVal}
            onDone={() => quickAdd.onDone(t.id)}
            onEdit={() => quickAdd.onEdit(t.id, t.name)}
            onDelete={() => quickAdd.onDelete(t.id)}
            onEditChange={quickAdd.onEditChange}
            onEditKeyDown={quickAdd.onEditKeyDown}
            onEditBlur={quickAdd.onEditBlur}
          />
        ))}
        {todayTasks.length === 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 600, color: "#93938A" }}>
            nothing marked for today. that&rsquo;s allowed.
          </div>
        )}
        <QuickAddBox {...quickAdd.box} sections={sections} />
      </TodayBlock>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ paddingLeft: 4 }}><Eyebrow>the rest &mdash; open when you&rsquo;re ready</Eyebrow></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))", gap: 14 }}>
          {sections.map((s) => {
            const secTasks = active.filter((t) => t.sectionId === s.id);
            return (
              <ListCard
                key={s.id}
                name={s.name}
                taskCount={secTasks.length}
                todayCount={secTasks.filter((t) => t.urgency === "Today").length}
                soonCount={secTasks.filter((t) => SOON_KEYS.includes(t.urgency)).length}
                onClick={() => onOpenList(s.id)}
              />
            );
          })}
          <AddListCard {...addList} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });

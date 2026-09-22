const { PageHeader, DonePanel, CalendarPanel, ErrorBanner } = window.ManualBrainDesignSystem_41bc1a;

const WEEKDAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const DAY_ABBR = ["sun","mon","tue","wed","thu","fri","sat"];

function App() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);

  const [sections, setSections] = React.useState(window.SECTIONS);
  const [tasks, setTasks] = React.useState(window.TASKS);
  const [view, setView] = React.useState("home");
  const [doneOpen, setDoneOpen] = React.useState(false);
  const [activeAdd, setActiveAdd] = React.useState(null);
  const [drafts, setDrafts] = React.useState({});
  const [quickSection, setQuickSection] = React.useState("s2");
  const [editing, setEditing] = React.useState(null);
  const [editVal, setEditVal] = React.useState("");
  const [menuFor, setMenuFor] = React.useState(null);
  const [addingSection, setAddingSection] = React.useState(false);
  const [newSectionName, setNewSectionName] = React.useState("");
  const [error, setError] = React.useState(null);
  const idRef = React.useRef(0);
  const nextId = (p) => p + "-" + (++idRef.current);

  React.useEffect(() => {
    if (!menuFor) return;
    const onDoc = (e) => { if (!e.target.closest(".mb-menu-anchor")) setMenuFor(null); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuFor]);

  const draft = (k) => drafts[k] || { text: "", urgency: "Today", custom: "" };
  const setDraft = (k, patch) => setDrafts((p) => ({ ...p, [k]: { ...draft(k), ...patch } }));
  const patch = (id, p) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));

  function addTask(key, sectionId) {
    const d = draft(key);
    const text = d.text.trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: nextId("t"), sectionId, name: text, urgency: d.urgency, customLabel: d.urgency === "Custom" ? d.custom.trim() || "Custom" : null, doneAt: null }]);
    setDrafts((p) => ({ ...p, [key]: { text: "", urgency: d.urgency, custom: "" } }));
  }
  function addSection() {
    const name = newSectionName.trim();
    setAddingSection(false);
    setNewSectionName("");
    if (!name) return;
    setSections((prev) => [...prev, { id: nextId("s"), name }]);
  }
  function startEdit(id, name) { setEditing(id); setEditVal(name); setMenuFor(null); setActiveAdd(null); }
  function saveEdit() {
    if (!editing) return;
    const name = editVal.trim();
    const id = editing;
    setEditing(null);
    if (name) patch(id, { name });
  }
  const editKeys = (e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); };

  const sectionName = (id) => (sections.find((s) => s.id === id) || {}).name || "";
  const active = tasks.filter((t) => !t.doneAt);
  const done = tasks.filter((t) => t.doneAt).sort((a, b) => (a.doneAt < b.doneAt ? 1 : -1));
  const activeSection = sections.find((s) => s.id === view) || null;

  const rowHandlers = {
    editing, editVal, menuFor,
    onDone: (id) => { patch(id, { doneAt: new Date().toISOString() }); setMenuFor(null); setEditing(null); },
    onEdit: startEdit,
    onDelete: (id) => { setTasks((prev) => prev.filter((t) => t.id !== id)); setMenuFor(null); },
    onEditChange: setEditVal,
    onEditKeyDown: editKeys,
    onEditBlur: saveEdit,
    onToggleMenu: (id) => setMenuFor((m) => (m === id ? null : id)),
    onPickUrgency: (id, k) => { patch(id, { urgency: k, customLabel: k === "Custom" ? "Custom" : null }); setMenuFor(null); },
  };

  const quickKey = "quick";
  const quickAdd = {
    ...rowHandlers,
    box: {
      open: activeAdd === quickKey,
      text: draft(quickKey).text,
      urgency: draft(quickKey).urgency,
      custom: draft(quickKey).custom,
      selectedSectionId: quickSection,
      onOpen: () => setActiveAdd(quickKey),
      onCancel: () => setActiveAdd(null),
      onTextChange: (v) => setDraft(quickKey, { text: v }),
      onCustomChange: (v) => setDraft(quickKey, { custom: v }),
      onUrgencyChange: (k) => setDraft(quickKey, { urgency: k }),
      onSectionPick: setQuickSection,
      onKeyDown: (e) => { if (e.key === "Enter") addTask(quickKey, quickSection); if (e.key === "Escape") setActiveAdd(null); },
      onAdd: () => addTask(quickKey, quickSection),
    },
  };

  const secKey = activeSection ? "sec:" + activeSection.id : "sec:none";
  const listAddBox = {
    open: activeAdd === secKey,
    text: draft(secKey).text,
    urgency: draft(secKey).urgency,
    custom: draft(secKey).custom,
    onOpen: () => setActiveAdd(secKey),
    onCancel: () => setActiveAdd(null),
    onTextChange: (v) => setDraft(secKey, { text: v }),
    onCustomChange: (v) => setDraft(secKey, { custom: v }),
    onUrgencyChange: (k) => setDraft(secKey, { urgency: k }),
    onKeyDown: (e) => { if (e.key === "Enter" && activeSection) addTask(secKey, activeSection.id); if (e.key === "Escape") setActiveAdd(null); },
    onAdd: () => activeSection && addTask(secKey, activeSection.id),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1520, margin: "0 auto", padding: "34px 36px 72px" }}>
      <PageHeader
        dateLabel={WEEKDAYS[today.getDay()] + " " + today.getDate() + " " + MONTHS[today.getMonth()]}
        meta={active.length + (active.length === 1 ? " task" : " tasks") + " in total · " + done.length + " done"}
      />
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
          {view === "home" ? (
            <HomeScreen
              sections={sections}
              tasks={tasks}
              sectionName={sectionName}
              quickAdd={quickAdd}
              onOpenList={(id) => { setView(id); setActiveAdd(null); setMenuFor(null); setEditing(null); }}
              addList={{
                adding: addingSection,
                value: newSectionName,
                onOpen: () => setAddingSection(true),
                onChange: setNewSectionName,
                onKeyDown: (e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") { setAddingSection(false); setNewSectionName(""); } },
                onCreate: addSection,
              }}
            />
          ) : (
            activeSection && (
              <ListScreen
                section={activeSection}
                tasks={active.filter((t) => t.sectionId === activeSection.id)}
                onBack={() => { setView("home"); setActiveAdd(null); setMenuFor(null); setEditing(null); }}
                row={rowHandlers}
                addBox={listAddBox}
              />
            )
          )}
          <DonePanel
            items={done.map((t) => ({ id: t.id, name: t.name, sectionName: sectionName(t.sectionId) }))}
            open={doneOpen}
            onToggle={() => setDoneOpen((v) => !v)}
            onUndo={(id) => patch(id, { doneAt: null })}
          />
        </div>

        <CalendarPanel
          todayLabel={"today · " + DAY_ABBR[today.getDay()] + " " + today.getDate()}
          tomorrowLabel={"tomorrow · " + DAY_ABBR[tomorrow.getDay()] + " " + tomorrow.getDate()}
          before={window.CALENDAR.before}
          after={window.CALENDAR.after}
          tomorrow={window.CALENDAR.tomorrow}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

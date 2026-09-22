const _DS = window.ManualBrainDesignSystem_41bc1a || {};
const TabBar = _DS.TabBar || (() => null);
const AddSheet = _DS.AddSheet || (() => null);
const UrgencySheet = _DS.UrgencySheet || (() => null);
const TaskSheet = _DS.TaskSheet || (() => null);

const WEEKDAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
// Shared with the seed so stored dueISO and its display string can't drift.
const fmtDue = (v) => window.fmtDue(v);
const isPast = (v) => window.isPast(v);

const TABS = [
  { id: "chat", label: "chat" },
  { id: "today", label: "today" },
  { id: "tomorrow", label: "tomorrow" },
  { id: "lists", label: "lists" },
  { id: "settings", label: "settings", glyph: "⚙︎" },
];

function IosApp() {
  const today = new Date();
  const tomorrowDate = new Date(today.getTime() + 86400000);
  const fmt = (d) => WEEKDAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];

  const [sections, setSections] = React.useState(window.SECTIONS);
  const [tasks, setTasks] = React.useState(window.TASKS);
  const [tab, setTab] = React.useState("today");
  const [openList, setOpenList] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [draft, setDraft] = React.useState({ text: "", sectionId: "s2", urgency: "Today", custom: "", due: "", minutes: null, when: "any time", repeat: "never" });
  const [urgencyFor, setUrgencyFor] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  // Defaults are the repo's own constant values (Dashboard.tsx).
  const [settings, setSettings] = React.useState({ urgencyDisplay: "pill", showQuickAdd: true });
  const [doneOpen, setDoneOpen] = React.useState(false);
  const [addingSection, setAddingSection] = React.useState(false);
  const [newSectionName, setNewSectionName] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [chatDraft, setChatDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const idRef = React.useRef(0);

  const sectionName = (id) => (sections.find((s) => s.id === id) || {}).name || "";
  const active = tasks.filter((t) => !t.doneAt);
  const done = tasks.filter((t) => t.doneAt);
  const patch = (id, p) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const listSection = sections.find((s) => s.id === openList) || null;
  const urgencyTask = tasks.find((t) => t.id === urgencyFor) || null;

  function startCompose(sectionId) {
    setDraft({ text: "", sectionId: sectionId || "s2", urgency: "Today", custom: "", due: "", minutes: null, when: "any time", repeat: "never" });
    setAddOpen(true);
  }
  function commit() {
    const text = draft.text.trim();
    if (!text) return;
    idRef.current += 1;
    setTasks((prev) => [...prev, {
      id: "n" + idRef.current, sectionId: draft.sectionId, name: text,
      urgency: draft.urgency, customLabel: draft.urgency === "Custom" ? draft.custom.trim() || "Custom" : null,
      dueISO: draft.due || null, due: fmtDue(draft.due), overdue: isPast(draft.due),
      minutes: draft.minutes, when: draft.when, repeat: draft.repeat,
      booked: null, doneAt: null,
    }]);
    setAddOpen(false);
  }
  function addSection() {
    const name = newSectionName.trim();
    setAddingSection(false);
    setNewSectionName("");
    if (!name) return;
    idRef.current += 1;
    setSections((prev) => [...prev, { id: "ns" + idRef.current, name }]);
  }

  async function send(textArg) {
    const text = (textArg || chatDraft).trim();
    if (!text || busy) return;
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatDraft("");
    setBusy(true);
    const reply = await window.askBrain({ text, history, tasks, sections, dateLabel: fmt(today) });
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setBusy(false);
  }

  const markDone = (id) => patch(id, { doneAt: new Date().toISOString() });

  function openTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setEditing({ ...t, dueISO: t.dueISO || "", when: t.when || "any time", repeat: t.repeat || "never" });
  }
  function saveTask() {
    if (!editing) return;
    const name = (editing.name || "").trim();
    if (!name) return;
    patch(editing.id, {
      name,
      sectionId: editing.sectionId,
      urgency: editing.urgency,
      customLabel: editing.urgency === "Custom" ? (editing.customLabel || "").trim() || "Custom" : null,
      dueISO: editing.dueISO || null,
      due: fmtDue(editing.dueISO),
      overdue: isPast(editing.dueISO),
      minutes: editing.minutes,
      when: editing.when,
      repeat: editing.repeat,
    });
    setEditing(null);
  }
  const toggleBook = (id) => setTasks((prev) => prev.map((t) => (t.id === id && t.booked !== null ? { ...t, booked: !t.booked } : t)));
  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  let screen;
  if (openList && listSection) {
    screen = (
      <ListDetailScreen
        section={listSection}
        tasks={active.filter((t) => t.sectionId === listSection.id)}
        onBack={() => setOpenList(null)}
        onDone={markDone}
        onNewTask={() => startCompose(listSection.id)}
        onPressUrgency={setUrgencyFor}
        onBook={toggleBook}
        onOpenTask={openTask}
        settings={settings}
      />
    );
  } else if (tab === "chat") {
    screen = (
      <ChatScreen
        messages={messages}
        draft={chatDraft}
        busy={busy}
        suggestions={window.SUGGESTIONS}
        onDraft={setChatDraft}
        onSend={() => send()}
        onPick={(s) => send(s)}
      />
    );
  } else if (tab === "tomorrow") {
    screen = (
      <TomorrowScreen
        tasks={tasks}
        sectionName={sectionName}
        dateLabel={fmt(tomorrowDate)}
        calendar={window.CALENDAR}
        onDone={markDone}
        onPressUrgency={setUrgencyFor}
        onBook={toggleBook}
        onOpenTask={openTask}
        settings={settings}
      />
    );
  } else if (tab === "settings") {
    screen = (
      <SettingsScreen
        settings={settings}
        onChange={(p) => setSettings((s) => ({ ...s, ...p }))}
        onLogOut={() => setMessages([])}
        taskCount={active.length}
        doneCount={done.length}
      />
    );
  } else if (tab === "lists") {
    screen = (
      <ListsScreen
        sections={sections}
        tasks={tasks}
        onOpenList={setOpenList}
        addList={{
          adding: addingSection,
          value: newSectionName,
          onOpen: () => setAddingSection(true),
          onChange: setNewSectionName,
          onKeyDown: (e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") { setAddingSection(false); setNewSectionName(""); } },
          onCreate: addSection,
        }}
      />
    );
  } else {
    screen = (
      <TodayScreen
        tasks={tasks}
        sectionName={sectionName}
        dateLabel={fmt(today)}
        meta={active.length + " tasks · " + done.length + " done"}
        calendar={window.CALENDAR}
        doneItems={done.map((t) => ({ id: t.id, name: t.name, sectionName: sectionName(t.sectionId) }))}
        doneOpen={doneOpen}
        onToggleDone={() => setDoneOpen((v) => !v)}
        onUndo={(id) => patch(id, { doneAt: null })}
        onDone={markDone}
        onNewTask={() => startCompose(null)}
        onBook={toggleBook}
        onOpenTask={openTask}
        settings={settings}
      />
    );
  }

  const isChat = tab === "chat" && !openList;

  return (
    <IOSDevice>
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-page)" }}>
        <div style={{ flex: 1, minHeight: 0, overflow: isChat ? "hidden" : "auto", paddingTop: 54 }}>{screen}</div>
        <div style={{ flex: "none", paddingBottom: 18, background: "var(--surface-card)" }}>
          <TabBar tabs={TABS} active={openList ? "lists" : tab} onSelect={(k) => { setOpenList(null); setTab(k); }} />
        </div>
        <AddSheet
          open={addOpen}
          text={draft.text}
          urgency={draft.urgency}
          custom={draft.custom}
          sections={sections}
          selectedSectionId={draft.sectionId}
          onClose={() => setAddOpen(false)}
          onTextChange={(v) => setDraft((d) => ({ ...d, text: v }))}
          onCustomChange={(v) => setDraft((d) => ({ ...d, custom: v }))}
          onUrgencyChange={(k) => setDraft((d) => ({ ...d, urgency: k }))}
          onSectionPick={(id) => setDraft((d) => ({ ...d, sectionId: id }))}
          due={draft.due}
          minutes={draft.minutes}
          when={draft.when}
          repeat={draft.repeat}
          onDueChange={(v) => setDraft((d) => ({ ...d, due: v }))}
          onMinutesChange={(v) => setDraft((d) => ({ ...d, minutes: v }))}
          onWhenChange={(v) => setDraft((d) => ({ ...d, when: v }))}
          onRepeatChange={(v) => setDraft((d) => ({ ...d, repeat: v }))}
          onAdd={commit}
        />
        <TaskSheet
          open={!!editing}
          task={editing}
          sections={sections}
          onChange={(p) => setEditing((e) => ({ ...e, ...p }))}
          onSave={saveTask}
          onClose={() => setEditing(null)}
          onDone={() => { markDone(editing.id); setEditing(null); }}
          onDelete={() => { removeTask(editing.id); setEditing(null); }}
        />
        <UrgencySheet
          open={!!urgencyTask}
          value={urgencyTask ? urgencyTask.urgency : null}
          onClose={() => setUrgencyFor(null)}
          onPick={(k) => { patch(urgencyFor, { urgency: k, customLabel: k === "Custom" ? "Custom" : null }); setUrgencyFor(null); }}
        />
      </div>
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<IosApp />);

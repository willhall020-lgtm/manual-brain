// Resolve components off the namespace lazily. If the compiled bundle is
// behind the sources, a missing piece degrades to a small placeholder
// instead of throwing and taking down every tab.
const DS = window.ManualBrainDesignSystem_41bc1a || {};
function dsMissing(name) {
  return function Missing() {
    return (
      <div style={{ border: "1px dashed var(--border-dashed)", borderRadius: "var(--radius-row)", padding: 14, fontSize: 12.5, fontWeight: 700, color: "var(--icon-rest)" }}>
        {name} isn&rsquo;t in the bundle yet &mdash; reload once.
      </div>
    );
  };
}
const ds = (name) => DS[name] || dsMissing(name);

const MobileNavBar = ds("MobileNavBar");
const MobileTaskRow = ds("MobileTaskRow");
const MobileListRow = ds("MobileListRow");
const TodayBlock = ds("TodayBlock");
const Eyebrow = ds("Eyebrow");
const DonePanel = ds("DonePanel");
const AddListCard = ds("AddListCard");
const AgendaList = ds("AgendaList");
const ChatBubble = ds("ChatBubble");
const ChatComposer = ds("ChatComposer");
const SuggestionChips = ds("SuggestionChips");
const SettingsRow = ds("SettingsRow");
const Chip = ds("Chip");

const PAD = { padding: "0 16px" };
const SOON = ["2–3 days", "End of this week"];

// ── 1. CHAT ──────────────────────────────────────────────────────
function ChatScreen({ messages, draft, busy, onDraft, onSend, onPick, suggestions }) {
  const endRef = React.useRef(null);
  React.useEffect(() => {
    const el = endRef.current;
    if (el && el.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, [messages.length, busy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <MobileNavBar dateLabel="ask your brain" title="chat" meta={busy ? "thinking…" : null} />
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", ...PAD, paddingBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            <ChatBubble from="brain">ask me what to do next, what&rsquo;s slipping, or to add something. i can see your lists.</ChatBubble>
            <SuggestionChips items={suggestions} onPick={onPick} />
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} from={m.role === "user" ? "me" : "brain"}>{m.content}</ChatBubble>
        ))}
        {busy && <ChatBubble from="brain" pending>thinking&hellip;</ChatBubble>}
        <div ref={endRef} />
      </div>
      <ChatComposer value={draft} busy={busy} onChange={onDraft} onSend={onSend} />
    </div>
  );
}

// ── 2. TODAY ─────────────────────────────────────────────────────
function TodayScreen({ tasks, sectionName, doneItems, doneOpen, onToggleDone, onUndo, onDone, onNewTask, onBook, onOpenTask, dateLabel, meta, calendar, settings = {} }) {
  const todayTasks = tasks.filter((t) => !t.doneAt && t.urgency === "Today");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 26 }}>
      <MobileNavBar dateLabel={dateLabel} meta={meta} />
      <div style={PAD}>
        <TodayBlock count={todayTasks.length} note={null}>
          {todayTasks.map((t) => (
            <MobileTaskRow key={t.id} name={t.name} sectionName={sectionName(t.sectionId)} variant="today"
              due={t.due} overdue={t.overdue} minutes={t.minutes} when={t.when} repeat={t.repeat} booked={t.booked}
              onPress={() => onOpenTask(t.id)}
              onDone={() => onDone(t.id)} onBook={() => onBook(t.id)} />
          ))}
          {todayTasks.length === 0 && (
            <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16, fontSize: 14.5, fontWeight: 600, color: "var(--text-subtle)" }}>
              nothing marked for today. that&rsquo;s allowed.
            </div>
          )}
          {settings.showQuickAdd !== false && <MAddStrip label="add something for today" tone="lime" onClick={onNewTask} />}
        </TodayBlock>
      </div>
      <div style={PAD}>
        <DonePanel items={doneItems} open={doneOpen} onToggle={onToggleDone} onUndo={onUndo} />
      </div>
      <div style={PAD}>
        <AgendaList before={calendar.before} after={calendar.after} />
      </div>
    </div>
  );
}

// ── 3. TOMORROW ──────────────────────────────────────────────────
function TomorrowScreen({ tasks, sectionName, onPressUrgency, onDone, onBook, onOpenTask, calendar, dateLabel, settings = {} }) {
  const active = tasks.filter((t) => !t.doneAt);
  const soon = active.filter((t) => SOON.includes(t.urgency));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 26 }}>
      <MobileNavBar dateLabel={dateLabel} title="tomorrow" meta={soon.length === 1 ? "1 task" : soon.length + " tasks"} />
      <div style={{ ...PAD, display: "flex", flexDirection: "column", gap: 10 }}>
        {soon.map((t) => (
          <MobileTaskRow key={t.id} name={t.name} sectionName={sectionName(t.sectionId)} urgency={t.urgency} customLabel={t.customLabel}
            urgencyDisplay={settings.urgencyDisplay} due={t.due} overdue={t.overdue} minutes={t.minutes} when={t.when} repeat={t.repeat} booked={t.booked}
            variant="list" onPress={() => onOpenTask(t.id)} onDone={() => onDone(t.id)}
            onPressUrgency={() => onPressUrgency(t.id)} onBook={() => onBook(t.id)} />
        ))}
        {soon.length === 0 && (
          <div style={{ background: "var(--surface-card)", border: "1px dashed var(--border-dashed)", borderRadius: "var(--radius-row)", padding: 16, fontSize: 14, fontWeight: 600, color: "var(--icon-rest)" }}>
            nothing lined up. tomorrow is open.
          </div>
        )}
      </div>
      <div style={PAD}>
        <AgendaList before={calendar.tomorrow} showNow={false} label="tomorrow&rsquo;s calendar" />
      </div>
    </div>
  );
}

// ── 4. LISTS ─────────────────────────────────────────────────────
function ListsScreen({ sections, tasks, onOpenList, addList }) {
  const active = tasks.filter((t) => !t.doneAt);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 26 }}>
      <MobileNavBar dateLabel="task lists" title="your lists" meta={active.length + " open"} />
      <div style={{ ...PAD, display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map((s) => {
          const st = active.filter((t) => t.sectionId === s.id);
          return (
            <MobileListRow key={s.id} name={s.name} taskCount={st.length}
              dueCount={st.filter((t) => t.due).length}
              onClick={() => onOpenList(s.id)} />
          );
        })}
        <AddListCard {...addList} />
      </div>
    </div>
  );
}

// ── 5. LIST DETAIL ───────────────────────────────────────────────
function ListDetailScreen({ section, tasks, onBack, onDone, onNewTask, onPressUrgency, onBook, onOpenTask, settings = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 26 }}>
      <MobileNavBar title={section.name} meta={tasks.length === 1 ? "1 task" : tasks.length + " tasks"} onBack={onBack} />
      <div style={PAD}>
        <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-panel)", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t) => (
            <MobileTaskRow key={t.id} name={t.name} urgency={t.urgency} customLabel={t.customLabel} variant="list"
              urgencyDisplay={settings.urgencyDisplay} due={t.due} overdue={t.overdue} minutes={t.minutes} when={t.when} repeat={t.repeat} booked={t.booked}
              onPress={() => onOpenTask(t.id)}
              onDone={() => onDone(t.id)} onPressUrgency={() => onPressUrgency(t.id)}
              onBook={() => onBook(t.id)} />
          ))}
          {tasks.length === 0 && (
            <div style={{ padding: 16, border: "1px dashed var(--mb-n-800)", borderRadius: "var(--radius-row)", fontSize: 14, fontWeight: 600, color: "var(--icon-rest)" }}>
              this list is empty. nice.
            </div>
          )}
          <MAddStrip label="add task" onClick={onNewTask} />
        </div>
      </div>
    </div>
  );
}

// ── 6. SETTINGS ──────────────────────────────────────────────────
// Only two of these are real: URGENCY_DISPLAY and SHOW_QUICK_ADD are
// constants in the repo's Dashboard.tsx, flagged there as "in case they need
// to become real settings later". The calendar row mirrors CalendarPanel's
// own "google · read only" label. Log out comes from the screenshots.
function SettingsScreen({ settings, onChange, onLogOut, taskCount, doneCount }) {
  const pair = (key, options) =>
    options.map((o) => (
      <Chip key={o.value} label={o.label} size="touch" selected={settings[key] === o.value} onClick={() => onChange({ [key]: o.value })} />
    ));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 26 }}>
      <MobileNavBar dateLabel="manual brain" title="settings" meta={taskCount + " tasks · " + doneCount + " done"} />

      <div style={{ ...PAD, display: "flex", flexDirection: "column", gap: 10 }}>
        <SettingsRow label="urgency labels" description="show the whole label on a task, or shrink it to a colour dot when rows feel busy.">
          {pair("urgencyDisplay", [{ value: "pill", label: "pill" }, { value: "dot", label: "dot" }])}
        </SettingsRow>

        <SettingsRow label="quick add" description="keep the add strip inside the today block, or hide it and add from a list instead.">
          {pair("showQuickAdd", [{ value: true, label: "shown" }, { value: false, label: "hidden" }])}
        </SettingsRow>

        <SettingsRow label="calendar" value="google · read only"
          description="manual brain can see your day so it can show you its shape. it never writes to your calendar." />

        <button
          onClick={onLogOut}
          className="mb-backbtn"
          style={{ minHeight: 48, background: "transparent", border: "1.5px solid var(--mb-n-750)", borderRadius: "var(--radius-pill)", fontSize: 12.5, fontWeight: "var(--fw-bold)", color: "var(--text-body)", marginTop: 4 }}
        >
          log out
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ChatScreen, TodayScreen, TomorrowScreen, ListsScreen, ListDetailScreen, SettingsScreen });

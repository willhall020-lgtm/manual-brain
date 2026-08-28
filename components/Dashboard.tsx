"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import TodayTaskRow from "@/components/TodayTaskRow";
import ListTaskRow from "@/components/ListTaskRow";
import QuickAddBox from "@/components/QuickAddBox";
import TaskAddBox from "@/components/TaskAddBox";
import DonePanel from "@/components/DonePanel";
import CalendarPanel from "@/components/CalendarPanel";
import ChatPanel from "@/components/ChatPanel";
import { SOON_KEYS, UrgencyKey } from "@/lib/urgency";
import type { Section, StateResponse, Task } from "@/lib/types";
import type { CalendarEvent } from "@/lib/gcal";

// Config that lived as editable `props` on the design-tool artboard —
// fixed here since there's no visual editor around this build, but kept as
// named constants in case they need to become real settings later.
const URGENCY_DISPLAY: "pill" | "dot" = "pill";
const SHOW_QUICK_ADD = true;

interface Draft {
  text: string;
  urgency: UrgencyKey;
  custom: string;
}
const emptyDraft = (): Draft => ({ text: "", urgency: "Today", custom: "" });

const WEEKDAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

interface Props {
  initialSections: Section[];
  initialTasks: Task[];
  todayISO: string;
  calendarEvents: CalendarEvent[];
  calendarConfigured: boolean;
  calendarError: boolean;
}

export default function Dashboard({
  initialSections,
  initialTasks,
  todayISO,
  calendarEvents,
  calendarConfigured,
  calendarError,
}: Props) {
  const router = useRouter();
  const [today] = useState(() => new Date(todayISO));
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [view, setView] = useState<string>("home"); // "home" | a section id
  const [doneOpen, setDoneOpen] = useState(false);
  const [activeAdd, setActiveAdd] = useState<string | null>(null); // "quick" | `sec:${id}` | null
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [quickSection, setQuickSection] = useState(
    () => initialSections[1]?.id ?? initialSections[0]?.id ?? ""
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // A plain counter (not Math.random/Date.now) for optimistic temp ids —
  // swapped for the server's real id once a create request resolves.
  const tempIdCounter = useRef(0);
  function nextTempId(prefix: string) {
    tempIdCounter.current += 1;
    return `${prefix}-${tempIdCounter.current}`;
  }

  const refetchAll = useCallback(async () => {
    const res = await fetch("/api/state");
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Failed to load Manual Brain data.");
    }
    const data: StateResponse = await res.json();
    const secs: Section[] = [];
    const flat: Task[] = [];
    for (const s of data.sections) {
      secs.push({ id: s.id, name: s.name });
      for (const t of s.tasks) {
        flat.push({
          id: t.id,
          sectionId: s.id,
          name: t.name,
          urgency: t.urgency,
          customLabel: t.customLabel,
          doneAt: t.doneAt,
        });
      }
    }
    setSections(secs);
    setTasks(flat);
  }, []);

  // Close an open urgency dropdown on outside click.
  useEffect(() => {
    if (!menuFor) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".mb-menu-anchor")) setMenuFor(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuFor]);

  function draft(key: string): Draft {
    return drafts[key] ?? emptyDraft();
  }
  function setDraft(key: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [key]: { ...draft(key), ...patch } }));
  }
  function patchTaskLocal(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function addTask(key: string, sectionId: string) {
    const d = draft(key);
    const text = d.text.trim();
    if (!text || !sectionId) return;
    const customLabel = d.urgency === "Custom" ? d.custom.trim() || "Custom" : null;
    const tempId = nextTempId("tmp-task");

    setTasks((prev) => [
      ...prev,
      { id: tempId, sectionId, name: text, urgency: d.urgency, customLabel, doneAt: null },
    ]);
    setDrafts((prev) => ({ ...prev, [key]: { text: "", urgency: d.urgency, custom: "" } }));

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          name: text,
          urgency: d.urgency,
          customLabel: customLabel ?? undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const row = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: row.id } : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setActionError("Couldn't save that task — try again.");
    }
  }

  async function addSection() {
    const name = newSectionName.trim();
    setAddingSection(false);
    setNewSectionName("");
    if (!name) return;

    const tempId = nextTempId("tmp-sec");
    setSections((prev) => [...prev, { id: tempId, name }]);

    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const row = await res.json();
      setSections((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: row.id } : s)));
    } catch {
      setSections((prev) => prev.filter((s) => s.id !== tempId));
      setActionError("Couldn't create that list — try again.");
    }
  }

  async function delSection(id: string) {
    const name = sections.find((s) => s.id === id)?.name ?? "this list";
    if (!window.confirm(`Delete "${name}" and all its tasks? This can't be undone.`)) return;

    const prevSections = sections;
    const prevTasks = tasks;
    setSections((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.sectionId !== id));
    setView("home");

    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setSections(prevSections);
      setTasks(prevTasks);
      setActionError("Couldn't delete that list — try again.");
    }
  }

  async function markDone(id: string) {
    patchTaskLocal(id, { doneAt: new Date().toISOString() });
    setMenuFor(null);
    setEditing(null);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: true }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setActionError("Couldn't sync that — refreshing.");
      refetchAll().catch(() => {});
    }
  }

  async function undo(id: string) {
    patchTaskLocal(id, { doneAt: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: false }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setActionError("Couldn't sync that — refreshing.");
      refetchAll().catch(() => {});
    }
  }

  async function del(id: string) {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setMenuFor(null);
    setEditing(null);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setTasks(prevTasks);
      setActionError("Couldn't delete that — try again.");
    }
  }

  async function setUrg(id: string, k: UrgencyKey) {
    const task = tasks.find((t) => t.id === id);
    const customLabel = k === "Custom" ? task?.customLabel || "Custom" : null;
    patchTaskLocal(id, { urgency: k, customLabel });
    setMenuFor(null);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urgency: k, customLabel: customLabel ?? undefined }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setActionError("Couldn't sync that — refreshing.");
      refetchAll().catch(() => {});
    }
  }

  function startEdit(id: string, name: string) {
    setEditing(id);
    setEditVal(name);
    setMenuFor(null);
    setActiveAdd(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const id = editing;
    const name = editVal.trim();
    setEditing(null);
    if (!name) return;
    patchTaskLocal(id, { name });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setActionError("Couldn't save that name — refreshing.");
      refetchAll().catch(() => {});
    }
  }

  function makeEditKeyHandler(onSave: () => void) {
    return (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onSave();
      if (e.key === "Escape") setEditing(null);
    };
  }
  // Deliberately not a `makeDraftKeyHandler(onAdd)` factory like the one
  // above: the handlers below close over `addTask`, which reads a ref
  // (tempIdCounter) — passing a ref-reading function through another
  // function call during render trips react-hooks/refs, so these stay as
  // plain inline handlers wired straight into the JSX event prop instead.

  // ---- derived view data ----
  const activeTasks = useMemo(() => tasks.filter((t) => !t.doneAt), [tasks]);
  const doneTasks = useMemo(
    () =>
      tasks
        .filter((t): t is Task & { doneAt: string } => !!t.doneAt)
        .sort((a, b) => (a.doneAt < b.doneAt ? 1 : -1)),
    [tasks]
  );
  const sectionName = useCallback(
    (id: string) => sections.find((s) => s.id === id)?.name ?? "",
    [sections]
  );
  const todayTasks = useMemo(
    () => activeTasks.filter((t) => t.urgency === "Today"),
    [activeTasks]
  );

  const isHome = view === "home";
  const activeSection = sections.find((s) => s.id === view) ?? null;
  const activeSectionTasks = useMemo(
    () => (activeSection ? activeTasks.filter((t) => t.sectionId === activeSection.id) : []),
    [activeTasks, activeSection]
  );

  const activeCount = activeTasks.length;
  const doneCount = doneTasks.length;
  const dateLabel = `${WEEKDAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        maxWidth: 1520,
        margin: "0 auto",
        padding: "34px 36px 72px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#8E8E85" }}>
            {dateLabel}
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-.035em",
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            Manual Brain
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8E8E85" }}>
            {activeCount} {activeCount === 1 ? "task" : "tasks"} in total · {doneCount} done
          </span>
          <button
            onClick={() => router.push("/settings")}
            style={{ background: "transparent", border: 0, fontSize: 11, fontWeight: 700, color: "#B0B0A7", cursor: "pointer" }}
          >
            SETTINGS
          </button>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            style={{ background: "transparent", border: 0, fontSize: 11, fontWeight: 700, color: "#B0B0A7", cursor: "pointer" }}
          >
            LOG OUT
          </button>
        </div>
      </div>

      {actionError && (
        <button
          onClick={() => setActionError(null)}
          style={{
            textAlign: "left",
            background: "#FDEDEB",
            color: "#B3261E",
            border: 0,
            borderRadius: 14,
            padding: "10px 14px",
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          {actionError} — tap to dismiss
        </button>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
          {isHome ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ background: "#D6EC3C", borderRadius: 22, padding: "18px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1 }}>
                      {todayTasks.length}
                    </span>
                    <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.02em", textTransform: "uppercase" }}>
                      for today
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setChatOpen(true)}
                      style={{
                        flex: "none",
                        background: "#14140F",
                        color: "#FFFFFF",
                        border: 0,
                        borderRadius: 99,
                        padding: "7px 13px",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: ".04em",
                      }}
                    >
                      CHAT → SCHEDULE TODAY
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {todayTasks.map((t) => (
                    <TodayTaskRow
                      key={t.id}
                      name={t.name}
                      sectionName={sectionName(t.sectionId)}
                      editing={editing === t.id}
                      editVal={editVal}
                      onDone={() => markDone(t.id)}
                      onEdit={() => startEdit(t.id, t.name)}
                      onDelete={() => del(t.id)}
                      onEditChange={setEditVal}
                      onEditKeyDown={makeEditKeyHandler(saveEdit)}
                      onEditBlur={saveEdit}
                    />
                  ))}

                  {todayTasks.length === 0 && (
                    <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 600, color: "#93938A" }}>
                      No tasks for today yet.
                    </div>
                  )}

                  {SHOW_QUICK_ADD && (
                    <QuickAddBox
                      open={activeAdd === "quick"}
                      text={draft("quick").text}
                      urgency={draft("quick").urgency}
                      custom={draft("quick").custom}
                      sections={sections}
                      selectedSectionId={quickSection}
                      onOpen={() => setActiveAdd("quick")}
                      onCancel={() => setActiveAdd(null)}
                      onTextChange={(v) => setDraft("quick", { text: v })}
                      onCustomChange={(v) => setDraft("quick", { custom: v })}
                      onUrgencyChange={(k) => setDraft("quick", { urgency: k })}
                      onSectionPick={setQuickSection}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask("quick", quickSection);
                        if (e.key === "Escape") setActiveAdd(null);
                      }}
                      onAdd={() => addTask("quick", quickSection)}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#8E8E85", paddingLeft: 4 }}>
                  TASK LISTS
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))", gap: 14 }}>
                  {sections.map((s) => {
                    const secTasks = activeTasks.filter((t) => t.sectionId === s.id);
                    const todayN = secTasks.filter((t) => t.urgency === "Today").length;
                    const soonN = secTasks.filter((t) => (SOON_KEYS as string[]).includes(t.urgency)).length;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setView(s.id);
                          setActiveAdd(null);
                          setMenuFor(null);
                          setEditing(null);
                        }}
                        className="mb-sectionbox"
                        style={{
                          textAlign: "left",
                          background: "#FFFFFF",
                          border: "1px solid #E6E6E0",
                          borderRadius: 20,
                          padding: "16px 16px 14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 22,
                          minHeight: 126,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, width: "100%" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.1 }}>
                            {s.name}
                          </span>
                          <span style={{ flex: "none", fontSize: 15, fontWeight: 700, color: "#C4C4BB" }}>→</span>
                        </div>
                        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8E8E85" }}>
                            {secTasks.length === 1 ? "1 task" : `${secTasks.length} tasks`}
                          </span>
                          {todayN > 0 && (
                            <span style={{ background: "#D6EC3C", color: "#14140F", borderRadius: 99, padding: "3px 9px", fontSize: 10.5, fontWeight: 800, letterSpacing: ".03em" }}>
                              {todayN} today
                            </span>
                          )}
                          {soonN > 0 && (
                            <span style={{ background: "#E3E5FD", color: "#2B34EE", borderRadius: 99, padding: "3px 9px", fontSize: 10.5, fontWeight: 800, letterSpacing: ".03em" }}>
                              {soonN} soon
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {addingSection ? (
                    <div style={{ background: "#FFFFFF", border: "1.5px solid #14140F", borderRadius: 20, padding: 16, display: "flex", flexDirection: "column", gap: 12, minHeight: 126 }}>
                      <input
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addSection();
                          if (e.key === "Escape") {
                            setAddingSection(false);
                            setNewSectionName("");
                          }
                        }}
                        autoFocus
                        placeholder="List name"
                        style={{ width: "100%", border: 0, borderBottom: "2px solid #2B34EE", outline: "none", background: "transparent", fontSize: 16, fontWeight: 800, letterSpacing: "-.02em", padding: "2px 0" }}
                      />
                      <button
                        onClick={addSection}
                        style={{ marginTop: "auto", background: "#14140F", color: "#FFFFFF", border: 0, borderRadius: 99, padding: "8px 12px", fontSize: 11, fontWeight: 800, letterSpacing: ".05em" }}
                      >
                        CREATE LIST
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSection(true)}
                      className="mb-addlist"
                      style={{ background: "transparent", border: "1.5px dashed #CFCFC6", borderRadius: 20, color: "#93938A", fontSize: 14, fontWeight: 700, padding: 16, minHeight: 126, display: "flex", alignItems: "flex-end", textAlign: "left" }}
                    >
                      + Add a list
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            activeSection && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setView("home");
                      setActiveAdd(null);
                      setMenuFor(null);
                      setEditing(null);
                    }}
                    className="mb-backbtn"
                    style={{ background: "transparent", border: "1.5px solid #DCDCD5", borderRadius: 99, padding: "8px 15px", fontSize: 12, fontWeight: 700, color: "#14140F" }}
                  >
                    ← All lists
                  </button>
                  <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.03em" }}>{activeSection.name}</h2>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#93938A" }}>
                    {activeSectionTasks.length === 1 ? "1 task" : `${activeSectionTasks.length} tasks`}
                  </span>
                  <button
                    onClick={() => delSection(activeSection.id)}
                    title="Delete list"
                    className="mb-iconbtn-danger"
                    style={{ marginLeft: "auto", background: "transparent", border: "1.5px solid #DCDCD5", borderRadius: 99, padding: "8px 15px", fontSize: 12, fontWeight: 700, color: "#93938A" }}
                  >
                    Delete list
                  </button>
                </div>

                <div style={{ background: "#EEEEEA", borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeSectionTasks.map((t) => (
                    <ListTaskRow
                      key={t.id}
                      name={t.name}
                      urgency={t.urgency}
                      customLabel={t.customLabel}
                      urgencyDisplay={URGENCY_DISPLAY}
                      editing={editing === t.id}
                      editVal={editVal}
                      menuOpen={menuFor === t.id}
                      onDone={() => markDone(t.id)}
                      onEdit={() => startEdit(t.id, t.name)}
                      onDelete={() => del(t.id)}
                      onEditChange={setEditVal}
                      onEditKeyDown={makeEditKeyHandler(saveEdit)}
                      onEditBlur={saveEdit}
                      onToggleMenu={() => setMenuFor((m) => (m === t.id ? null : t.id))}
                      onPickUrgency={(k) => setUrg(t.id, k)}
                    />
                  ))}

                  {activeSectionTasks.length === 0 && (
                    <div style={{ padding: 14, border: "1px dashed #D6D6CE", borderRadius: 14, fontSize: 13.5, fontWeight: 600, color: "#A3A39A" }}>
                      This list is empty. Nice.
                    </div>
                  )}

                  <div style={{ marginTop: 2 }}>
                    <TaskAddBox
                      open={activeAdd === `sec:${activeSection.id}`}
                      text={draft(`sec:${activeSection.id}`).text}
                      urgency={draft(`sec:${activeSection.id}`).urgency}
                      custom={draft(`sec:${activeSection.id}`).custom}
                      onOpen={() => setActiveAdd(`sec:${activeSection.id}`)}
                      onCancel={() => setActiveAdd(null)}
                      onTextChange={(v) => setDraft(`sec:${activeSection.id}`, { text: v })}
                      onCustomChange={(v) => setDraft(`sec:${activeSection.id}`, { custom: v })}
                      onUrgencyChange={(k) => setDraft(`sec:${activeSection.id}`, { urgency: k })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(`sec:${activeSection.id}`, activeSection.id);
                        if (e.key === "Escape") setActiveAdd(null);
                      }}
                      onAdd={() => addTask(`sec:${activeSection.id}`, activeSection.id)}
                    />
                  </div>
                </div>
              </div>
            )
          )}

          <DonePanel
            items={doneTasks.map((t) => ({ id: t.id, name: t.name, sectionName: sectionName(t.sectionId) }))}
            open={doneOpen}
            onToggle={() => setDoneOpen((v) => !v)}
            onUndo={undo}
            onDelete={del}
          />
        </div>

        <CalendarPanel
          today={today}
          events={calendarEvents}
          configured={calendarConfigured}
          loadError={calendarError}
        />
      </div>

      {chatOpen && (
        <div
          onClick={() => setChatOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,20,15,.32)",
            zIndex: 40,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(440px, 100vw)",
              height: "100vh",
              background: "#F7F7F3",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow: "-8px 0 32px rgba(0,0,0,.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em" }}>Chat</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{ background: "transparent", border: 0, fontSize: 20, lineHeight: 1, color: "#8E8E85", cursor: "pointer", padding: 4 }}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ChatPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

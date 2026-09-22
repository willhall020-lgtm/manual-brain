// Starter content mirroring scripts/seed.mjs plus the scheduling fields
// visible in the project screenshots (due / minutes / when / repeat /
// booked). Those are NOT in the repo schema yet — see ../../readme.md
// "Known gaps", which also explains why the screenshot's attachment
// paperclip has no field here.
const SECTIONS = [
  { id: "s1", name: "Work (Deloitte)" },
  { id: "s2", name: "Personal projects" },
  { id: "s3", name: "Life admin" },
  { id: "s4", name: "Applications" },
];

// dueISO is the stored value; `due` (display) and `overdue` are always
// derived from it, so editing a task round-trips instead of losing the date.
const MONTH_ABBR = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function midnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function fmtDue(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return null;
  const today = midnight(new Date());
  const diff = Math.round((midnight(d) - today) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return d.getDate() + " " + MONTH_ABBR[d.getMonth()];
}
function isPast(iso) {
  if (!iso) return false;
  const d = new Date(iso + "T00:00:00");
  return !isNaN(d) && midnight(d) < midnight(new Date());
}
function iso(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const T = (o) => {
  const t = { urgency: "Today", customLabel: null, dueISO: null, minutes: null, when: "any time", repeat: "never", booked: null, doneAt: null, ...o };
  return { ...t, due: fmtDue(t.dueISO), overdue: isPast(t.dueISO) };
};

const TASKS = [
  T({ id: "t1", sectionId: "s4", name: "Founders factory application", dueISO: iso(-4), minutes: 40, when: "any time", booked: true }),
  T({ id: "t2", sectionId: "s4", name: "Apply to baby vc bootcamp", dueISO: iso(0), minutes: 60, when: "afternoon", booked: true }),
  T({ id: "t3", sectionId: "s1", name: "Adopt docker approach on current skills", dueISO: iso(0), minutes: 45, when: "afternoon", booked: true }),
  T({ id: "t4", sectionId: "s2", name: "manual brain ios app design", dueISO: iso(0), minutes: 30, when: "afternoon", booked: false }),
  T({ id: "t5", sectionId: "s1", name: "Finish IDV PRD comments", urgency: "2–3 days", minutes: 20, when: "morning" }),
  T({ id: "t6", sectionId: "s1", name: "Address Egor's comments", urgency: "2–3 days", minutes: 30, when: "morning", booked: true }),
  T({ id: "t7", sectionId: "s1", name: "Finish creating evals", urgency: "End of this week", minutes: 60 }),
  T({ id: "t8", sectionId: "s1", name: "Request more claude credit", urgency: "This month", minutes: 20 }),
  T({ id: "t9", sectionId: "s2", name: "Take product problems from Claude and test", urgency: "End of this week", minutes: 40 }),
  T({ id: "t10", sectionId: "s2", name: "Sketch the weekly review screen", urgency: "This month", minutes: 45 }),
  T({ id: "t11", sectionId: "s2", name: "Tidy the spare room", urgency: "Custom", customLabel: "before Sam visits", minutes: 30 }),
  T({ id: "t12", sectionId: "s3", name: "Renew passport", urgency: "End of this week", dueISO: iso(8), minutes: 45 }),
  T({ id: "t13", sectionId: "s3", name: "Book physio", urgency: "2–3 days", minutes: 15 }),
  T({ id: "t14", sectionId: "s3", name: "Cancel the old gym membership", urgency: "This month", minutes: 15 }),
  T({ id: "t15", sectionId: "s3", name: "Weekly meds refill", urgency: "This month", repeat: "weekly", minutes: 15 }),
  T({ id: "t16", sectionId: "s4", name: "apply to antler scheme", urgency: "2–3 days", minutes: 30, when: "evening", booked: true }),
  T({ id: "t17", sectionId: "s3", name: "Book dentist", doneAt: "2026-09-01T08:10:00Z" }),
  T({ id: "t18", sectionId: "s1", name: "Send Monday invoice", repeat: "weekly", doneAt: "2026-09-01T07:40:00Z" }),
];

const CALENDAR = {
  before: [
    { time: "09:00", title: "Address Egor's comments (Deloitte/Converge work)", meta: "30 min", barColor: "#2B34EE" },
    { time: "10:00", title: "Finish creating evals", meta: "1 hr", barColor: "#2B34EE" },
    { time: "11:10", title: "Finish IDV PRD comments", meta: "20 min", barColor: "#2B34EE" },
    { time: "11:40", title: "Request more claude credit or use Egor's", meta: "20 min", barColor: "#2B34EE" },
    { time: "14:00", title: "Adopt docker approach on current skills", meta: "45 min", barColor: "#2B34EE" },
  ],
  after: [
    { time: "16:00", title: "Apply to baby vc bootcamp", meta: "1 hr", barColor: "#C6C9FA" },
    { time: "19:00", title: "apply to antler scheme", meta: "30 min", barColor: "#C6C9FA" },
  ],
  tomorrow: [
    { time: "09:00", title: "Workshop prep", meta: "2 hrs", barColor: "#EAEAE4", dim: true },
    { time: "14:00", title: "Design crit", meta: "1 hr", barColor: "#EAEAE4", dim: true },
  ],
};

Object.assign(window, { SECTIONS, TASKS, CALENDAR, fmtDue, isPast });

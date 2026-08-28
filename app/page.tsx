import Dashboard from "@/components/Dashboard";
import { getState } from "@/lib/data";
import { getCalendarEvents, type CalendarEvent } from "@/lib/gcal";

// Reads Neon on every request rather than at build time — there is no
// static content here, it's always someone's live task list.
export const dynamic = "force-dynamic";

export default async function Page() {
  let sections;
  let tasks;
  let loadError: string | null = null;

  try {
    ({ sections, tasks } = await getState());
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load Manual Brain data.";
  }

  // Calendar is best-effort: a broken/unset feed shouldn't take the whole
  // dashboard down, so its failure is kept separate from `loadError` above
  // and just collapses the sidebar into an inline message instead.
  const calendarConfigured = !!process.env.GCAL_ICS_URL;
  let calendarEvents: CalendarEvent[] = [];
  let calendarError = false;
  if (calendarConfigured) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(startOfToday);
    rangeEnd.setDate(rangeEnd.getDate() + 2);
    try {
      calendarEvents = await getCalendarEvents(startOfToday, rangeEnd);
    } catch {
      calendarError = true;
    }
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "34px 36px" }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E6E6E0",
            borderRadius: 22,
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Couldn&apos;t load Manual Brain</h1>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "#5E5E56", lineHeight: 1.5 }}>
            {loadError}
          </p>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: "#93938A", lineHeight: 1.5 }}>
            This usually means <code>DATABASE_URL</code> isn&apos;t set, or the database hasn&apos;t been
            migrated yet. Locally: copy <code>.env.example</code> to <code>.env.local</code>, add your Neon
            connection string, then run <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      initialSections={sections!}
      initialTasks={tasks!}
      todayISO={new Date().toISOString()}
      calendarEvents={calendarEvents}
      calendarConfigured={calendarConfigured}
      calendarError={calendarError}
    />
  );
}

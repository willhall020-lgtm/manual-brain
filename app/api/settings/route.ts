import { NextResponse } from "next/server";
import { isGoogleCalendarConnected, isGoogleOAuthConfigured } from "@/lib/google-auth";
import { DEFAULT_PLANNING_RULES, getPlanningRules } from "@/lib/preferences";

// One consolidated read for the settings screen — the web app's /settings
// page computes all of this server-side (it's a Server Component); a
// non-browser client (the iOS app) needs it as JSON instead. Everything
// here is read-only — the actual mutation is the existing
// POST /api/preferences (planning rules) and the existing
// GET /api/auth/google/start redirect (Google Calendar connect), both
// unchanged by this route.

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const googleOAuthConfigured = isGoogleOAuthConfigured();
    const googleCalendarConnected = googleOAuthConfigured
      ? await isGoogleCalendarConnected().catch(() => false)
      : false;
    const planningRules = await getPlanningRules().catch(() => DEFAULT_PLANNING_RULES);

    return NextResponse.json({
      calendarReadConfigured: !!process.env.GCAL_ICS_URL,
      googleOAuthConfigured,
      googleCalendarConnected,
      planningRules,
      defaultPlanningRules: DEFAULT_PLANNING_RULES,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load settings." },
      { status: 500 }
    );
  }
}

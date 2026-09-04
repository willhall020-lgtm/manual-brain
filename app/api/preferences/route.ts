import { NextResponse } from "next/server";
import { getPlanningRules, savePlanningRules } from "@/lib/preferences";

export const dynamic = "force-dynamic";

// GET added alongside the iOS client: the web /settings page reads planning
// rules server-side (a Server Component), which a non-browser client can't
// do — this mirrors that same read as JSON. POST below is unchanged.
export async function GET() {
  try {
    const planningRules = await getPlanningRules();
    return NextResponse.json({ planningRules });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load preferences.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const planningRules = typeof body?.planningRules === "string" ? body.planningRules : "";
    const saved = await savePlanningRules(planningRules);
    return NextResponse.json({ planningRules: saved });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save preferences.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { savePlanningRules } from "@/lib/preferences";

export const dynamic = "force-dynamic";

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

import Link from "next/link";
import { isGoogleCalendarConnected, isGoogleOAuthConfigured } from "@/lib/google-auth";
import { DEFAULT_PLANNING_RULES, getPlanningRules } from "@/lib/preferences";
import PreferencesForm from "@/components/PreferencesForm";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E6E6E0",
  borderRadius: 22,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google_connected?: string; google_error?: string }>;
}) {
  const params = await searchParams;
  const configured = isGoogleOAuthConfigured();
  const connected = configured ? await isGoogleCalendarConnected().catch(() => false) : false;
  const planningRules = await getPlanningRules().catch(() => DEFAULT_PLANNING_RULES);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "34px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link
          href="/"
          style={{ background: "transparent", border: "1.5px solid #DCDCD5", borderRadius: 99, padding: "8px 15px", fontSize: 12, fontWeight: 700, color: "#14140F", textDecoration: "none" }}
        >
          ← Back
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.03em" }}>Settings</h1>
      </div>

      {params.google_connected && (
        <div style={{ ...card, background: "#EFF8E4", border: "1px solid #D3E8BA" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#3D5C1B" }}>
            Google Calendar connected — the chat can now book events.
          </span>
        </div>
      )}
      {params.google_error && (
        <div style={{ ...card, background: "#FDEDEB", border: "1px solid #F5C9C2" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#B3261E" }}>
            Couldn&apos;t connect: {params.google_error}
          </span>
        </div>
      )}

      <div style={card}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#8E8E85" }}>
          GOOGLE CALENDAR — WRITE ACCESS
        </span>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "#5E5E56", lineHeight: 1.5 }}>
          Separate from the read-only sidebar preview. This lets the chat actually book events on your
          calendar rather than just reading it.
        </p>

        {!configured && (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#93938A" }}>
            Not set up yet — add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> first.
          </span>
        )}

        {configured && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: ".03em",
                color: connected ? "#3D5C1B" : "#93938A",
              }}
            >
              {connected ? "CONNECTED" : "NOT CONNECTED"}
            </span>
            <a
              href="/api/auth/google/start"
              style={{
                background: "#14140F",
                color: "#FFFFFF",
                border: 0,
                borderRadius: 99,
                padding: "8px 14px",
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".04em",
                textDecoration: "none",
              }}
            >
              {connected ? "RECONNECT" : "CONNECT"}
            </a>
          </div>
        )}
      </div>

      <div style={card}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#8E8E85" }}>
          PLANNING RULES
        </span>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "#5E5E56", lineHeight: 1.5 }}>
          How the chat decides what to book and when — both the interactive chat and the 09:15 BST
          morning run. Free text, read by the model rather than parsed, so write it however makes
          sense to you.
        </p>
        <PreferencesForm initialValue={planningRules} defaultValue={DEFAULT_PLANNING_RULES} />
      </div>
    </div>
  );
}

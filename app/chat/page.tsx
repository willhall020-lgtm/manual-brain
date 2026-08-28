import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "34px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link
          href="/"
          style={{ background: "transparent", border: "1.5px solid #DCDCD5", borderRadius: 99, padding: "8px 15px", fontSize: 12, fontWeight: 700, color: "#14140F", textDecoration: "none" }}
        >
          ← Back
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.03em" }}>Chat</h1>
      </div>
      <ChatPanel />
    </div>
  );
}

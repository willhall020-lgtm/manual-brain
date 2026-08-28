"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

// useSearchParams needs a Suspense boundary or Next bails the whole route
// out of static rendering — this page is tiny, so just wrap it here rather
// than splitting into a separate client file.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Couldn't log in.");
      }
      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't log in.");
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#FFFFFF",
          border: "1px solid #E6E6E0",
          borderRadius: 22,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-.03em",
            textTransform: "uppercase",
          }}
        >
          Manual Brain
        </h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            border: "1px solid #DCDCD5",
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 15,
            outline: "none",
          }}
        />
        {error && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#B3261E" }}>{error}</span>
        )}
        <button
          type="submit"
          disabled={submitting || !password}
          style={{
            background: "#14140F",
            color: "#FFFFFF",
            border: 0,
            borderRadius: 99,
            padding: "10px 14px",
            fontSize: 12.5,
            fontWeight: 800,
            letterSpacing: ".04em",
            opacity: submitting || !password ? 0.6 : 1,
          }}
        >
          {submitting ? "CHECKING…" : "ENTER"}
        </button>
      </form>
    </div>
  );
}

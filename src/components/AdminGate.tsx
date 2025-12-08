"use client";

import { useEffect, useState } from "react";

type AdminGateProps = {
  children: React.ReactNode;
};

export function AdminGate({ children }: AdminGateProps) {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("locustgrubAdmin");
    if (stored === "true") {
      setIsAuthed(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Incorrect password.");
        return;
      }

      setIsAuthed(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("locustgrubAdmin", "true");
      }
      setPassword("");
    } catch (err) {
      console.error(err);
      setError("Could not verify password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Admin access
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the admin password to view the dashboard.
          </p>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </label>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

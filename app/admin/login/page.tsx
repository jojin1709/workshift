"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * This is a minimal admin gate: an allowlisted email plus a shared
 * secret configured server-side (ADMIN_SESSION_SECRET /
 * ADMIN_ALLOWED_EMAILS). It's intentionally simple and clearly
 * documented so a real deployment can swap in SSO/OAuth without
 * touching the public site, which has no login at all.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, passphrase })
    });
    if (!res.ok) {
      setError("Invalid credentials.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-1 text-sm text-navy-500">Internal use only. The public site never requires this.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full rounded-xl border border-navy-900/15 px-4 py-2.5"
        />
        <input
          type="password"
          required
          placeholder="Passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="focus-ring w-full rounded-xl border border-navy-900/15 px-4 py-2.5"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="focus-ring w-full rounded-xl bg-brand-500 px-4 py-2.5 font-medium text-white">
          Sign in
        </button>
      </form>
    </div>
  );
}

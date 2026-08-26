"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      window.location.href = "/admin/dashboard";
    } else {
      setError("Incorrect admin password.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <LockKeyhole className="mb-4 h-8 w-8 text-blue-400" />
        <h1 className="text-2xl font-black">Admin login</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your store password to continue.</p>
        <input
          autoFocus
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="Admin password"
        />
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
        <button disabled={isSubmitting} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 disabled:opacity-60">
          {isSubmitting ? "Checking..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
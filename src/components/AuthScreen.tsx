"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("sign-in");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col justify-center gap-6 px-4 py-12 min-h-screen">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Logbook</h1>
        <p className="text-sm text-neutral-500">
          {mode === "sign-in" ? "Sign in to your logbook" : "Create your logbook account"}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Password</span>
          <input
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {notice && <p className="text-sm font-medium text-blue-700">{notice}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white disabled:bg-neutral-300"
        >
          {submitting ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Sign up"}
        </button>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200" />
          or
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-xl border border-neutral-300 bg-white py-3.5 text-base font-semibold text-neutral-700 active:bg-neutral-50"
        >
          Continue with Google
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError(null);
          setNotice(null);
        }}
        className="text-center text-sm font-medium text-blue-600"
      >
        {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}

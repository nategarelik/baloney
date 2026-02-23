"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

function LoginForm() {
  const { signIn, signInWithMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    router.push(redirect);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signInWithMagicLink(email);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    setMagicLinkSent(true);
  }

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">&#x2709;</div>
        <h1 className="font-display text-2xl text-secondary mb-2">
          Check your email
        </h1>
        <p className="text-secondary/70">
          We sent a magic link to <strong>{email}</strong>. Click the link in
          the email to sign in.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="mt-6 text-sm text-primary hover:underline"
        >
          Try a different method
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-lg p-8">
      <h1 className="font-display text-3xl text-secondary text-center mb-2">
        Sign in to Baloney
      </h1>
      <p className="text-center text-secondary/60 mb-8">
        Your AI content detection dashboard
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("password")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "password"
              ? "bg-primary text-white"
              : "bg-secondary/5 text-secondary/60 hover:text-secondary"
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setMode("magic")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "magic"
              ? "bg-primary text-white"
              : "bg-secondary/5 text-secondary/60 hover:text-secondary"
          }`}
        >
          Magic Link
        </button>
      </div>

      <form
        onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
      >
        <label className="block text-sm font-medium text-secondary/80 mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
          placeholder="you@example.com"
        />

        {mode === "password" && (
          <>
            <label className="block text-sm font-medium text-secondary/80 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
              placeholder="Your password"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading
            ? "Signing in..."
            : mode === "password"
              ? "Sign In"
              : "Send Magic Link"}
        </button>
      </form>

      <p className="text-center text-sm text-secondary/50 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-pulse text-secondary/40">Loading...</div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}

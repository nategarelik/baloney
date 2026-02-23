"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">&#x2705;</div>
          <h1 className="font-display text-2xl text-secondary mb-2">
            Check your email
          </h1>
          <p className="text-secondary/70">
            We sent a confirmation link to <strong>{email}</strong>. Click the
            link to verify your account.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-sm text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-lg p-8">
        <h1 className="font-display text-3xl text-secondary text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-secondary/60 mb-8">
          Start detecting AI-generated content
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <label className="block text-sm font-medium text-secondary/80 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            placeholder="At least 8 characters"
          />

          <label className="block text-sm font-medium text-secondary/80 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
            placeholder="Repeat your password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-secondary/50 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

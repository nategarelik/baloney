"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">&#x1F615;</div>
        <h1 className="font-display text-3xl text-secondary mb-3">
          Something went wrong
        </h1>
        <p className="text-secondary/60 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

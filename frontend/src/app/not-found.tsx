import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">&#x1F50D;</div>
        <h1 className="font-display text-3xl text-secondary mb-3">
          Page not found
        </h1>
        <p className="text-secondary/60 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

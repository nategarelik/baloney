"use client";

import Link from "next/link";

const CHROME_STORE_URL = "https://chromewebstore.google.com/";

export default function Home() {
  return (
    <main className="min-h-screen bg-base">
      {/* ── Hero — full-width Mona Lisa background ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "92vh" }}
      >
        {/* Background image */}
        <img
          src="/mona_lisa_pig.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay so text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(240,230,202,0.88) 0%, rgba(240,230,202,0.72) 42%, rgba(240,230,202,0.1) 70%, transparent 100%)",
          }}
        />
        {/* Content sits on top */}
        <div
          className="relative z-10 max-w-6xl mx-auto px-6 flex items-center"
          style={{ minHeight: "92vh" }}
        >
          {/* Left column — headline + CTA */}
          <div className="max-w-lg pt-24 pb-16">
            <h1 className="font-display text-5xl md:text-6xl text-secondary leading-[1.1] mb-5">
              Tell What&rsquo;s Baloney
            </h1>
            <p className="text-lg text-secondary/75 mb-8 leading-relaxed">
              Your all-purpose truth verifier. Detect AI-generated content as
              you browse — and see how much of the internet is real.
            </p>
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 text-base btn-primary-3d"
            >
              Try Free Now
            </a>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Screenshots ── */}
      <section className="py-20" style={{ background: "#d4456b" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="font-display text-3xl text-center mb-4"
            style={{ color: "#f0e6ca" }}
          >
            Know What&rsquo;s <span style={{ color: "#e8c97a" }}>Real</span> on
            Social Media
          </h2>
          <p
            className="text-center mb-12 max-w-2xl mx-auto"
            style={{ color: "rgba(240,230,202,0.85)" }}
          >
            Baloney scans{" "}
            <span style={{ color: "#e8c97a" }}>images and text</span> as you
            scroll, flagging{" "}
            <span style={{ color: "#e8c97a" }}>AI-generated</span> content in
            real time. Here&rsquo;s what it looks like in action.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="aspect-video rounded-lg border flex items-center justify-center"
              style={{
                background: "rgba(240,230,202,0.1)",
                borderColor: "rgba(240,230,202,0.25)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: "rgba(240,230,202,0.45)" }}
              >
                Screenshot: Extension on X — 16:9
              </span>
            </div>
            <div
              className="aspect-video rounded-lg border flex items-center justify-center"
              style={{
                background: "rgba(240,230,202,0.1)",
                borderColor: "rgba(240,230,202,0.25)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: "rgba(240,230,202,0.45)" }}
              >
                Screenshot: Extension on LinkedIn — 16:9
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-secondary mb-4">
          See How It Works
        </h2>
        <p className="text-secondary/60 mb-10 max-w-xl mx-auto">
          Install the extension, browse normally, and let Baloney do the rest.
          It&rsquo;s that simple.
        </p>
        <Link
          href="/product"
          className="inline-block px-8 py-3.5 border-2 border-secondary/20 text-secondary font-semibold rounded-full hover:bg-secondary/5 transition-colors text-base"
        >
          Learn More
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-sm text-secondary/40 border-t border-secondary/10">
        <img
          src="/baloney.png"
          alt="Baloney"
          className="h-12 w-12 mx-auto mb-4"
          style={{ mixBlendMode: "multiply" }}
        />
        Built at MadData26 &middot; UW&ndash;Madison Data Science Hackathon
        &middot; Feb 2026
      </footer>
    </main>
  );
}

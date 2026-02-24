"use client";

import Link from "next/link";
import { MadDataWinner } from "@/components/MadDataWinner";

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
        {/* Glassy detection square around the pig's face */}
        <div
          className="absolute z-10 hidden md:block"
          style={{
            top: "calc(8% + 81px)",
            right: "calc(14% + 45px)",
            width: 260,
            height: 260,
            border: "3px solid rgba(255,255,255,0.55)",
            borderTop: "3px solid rgba(255,255,255,0.85)",
            borderLeft: "3px solid rgba(255,255,255,0.7)",
            borderRight: "3px solid rgba(255,255,255,0.4)",
            borderBottom: "3px solid rgba(255,255,255,0.3)",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            boxShadow:
              "0 0 24px rgba(255,255,255,0.15), " +
              "0 1px 3px rgba(0,0,0,0.12), " +
              "inset 0 1px 0 rgba(255,255,255,0.5), " +
              "inset 0 -1px 0 rgba(0,0,0,0.15), " +
              "inset 1px 0 0 rgba(255,255,255,0.2), " +
              "inset -1px 0 0 rgba(0,0,0,0.05)",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
            animation: "hero-fade-in 0.7s ease-out 0.5s forwards",
            opacity: 0,
          }}
        >
          {/* Pixelated cursor at top-right corner */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            style={{
              position: "absolute",
              top: -2,
              right: -22,
              imageRendering: "pixelated",
              filter: "drop-shadow(1px 3px 4px rgba(0,0,0,0.45))",
              animation: "hero-fade-in 0.5s ease-out 0.6s forwards",
              opacity: 0,
            }}
          >
            <path
              d="M0,0 L0,12 L3,9 L6,14 L8,13 L5,8 L9,8 Z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1"
            />
          </svg>
          {/* Extension-style detection dot */}
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 62,
              height: 20,
              borderRadius: 10,
              padding: "0 8px",
              background: "rgba(212,69,107,0.85)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "hero-fade-in 0.5s ease-out 0.8s forwards",
              opacity: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              92% AI
            </span>
          </div>
        </div>
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
            <div
              className="mb-4 opacity-0"
              style={{ animation: "hero-fade-in 0.7s ease-out 0s forwards" }}
            >
              <MadDataWinner variant="banner" />
            </div>
            <h1
              className="font-display text-5xl md:text-6xl text-secondary leading-[1.1] mb-5 opacity-0"
              style={{ animation: "hero-fade-in 0.7s ease-out 0.1s forwards" }}
            >
              Cut The Baloney
            </h1>
            <p
              className="text-lg text-secondary/75 mb-8 leading-relaxed opacity-0"
              style={{ animation: "hero-fade-in 0.7s ease-out 0.15s forwards" }}
            >
              Your all-purpose truth verifier. Detect AI-generated content as
              you browse and see how much of the internet is real.
            </p>
            <div
              className="opacity-0"
              style={{ animation: "hero-fade-in 0.7s ease-out 0.3s forwards" }}
            >
              <span className="inline-block px-6 py-2.5 bg-secondary/10 text-secondary/70 font-medium rounded-full text-sm border border-secondary/15 mb-3">
                Chrome Web Store &mdash; Under Review
              </span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/nategarelik/baloney"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 text-base btn-primary-3d"
                >
                  View Source on GitHub
                </a>
              </div>
            </div>
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
            real time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                borderColor: "rgba(240,230,202,0.25)",
              }}
            >
              <img
                src="/screenshots/x-demo.gif"
                alt="Baloney extension detecting AI content on X"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                borderColor: "rgba(240,230,202,0.25)",
              }}
            >
              <img
                src="/screenshots/instagram-demo.gif"
                alt="Baloney extension detecting AI content on Instagram"
                className="w-full h-full object-cover"
              />
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

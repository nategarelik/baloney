"use client";

import { ScanSearch, Globe, Eye, Shield, BarChart3, Zap, Download, Settings, Chrome } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Scans images and text on any website — Instagram, X, Reddit, news sites, and more.",
  },
  {
    icon: Eye,
    title: "Auto-Scanning",
    description: "Automatically detects AI content as you scroll. No clicks needed.",
  },
  {
    icon: Shield,
    title: "Content Filtering",
    description: "Blur or hide AI-generated content. Choose Label, Blur, or Hide modes.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Stats",
    description: "Track scans, AI exposure, and per-page breakdowns in the popup.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Color-coded badges appear in milliseconds. Red = AI, Green = Human.",
  },
  {
    icon: ScanSearch,
    title: "Text Detection",
    description: "Paragraphs and articles get colored borders showing AI probability.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Download",
    description: "Download the Baloney extension folder from our GitHub repository.",
    icon: Download,
  },
  {
    num: "2",
    title: "Unpack",
    description: "Unzip the folder to a location on your computer you'll remember.",
    icon: Settings,
  },
  {
    num: "3",
    title: "Load Extension",
    description: "Open chrome://extensions, enable Developer Mode, click 'Load unpacked', and select the folder.",
    icon: Chrome,
  },
];

export default function ExtensionPage() {
  return (
    <main className="min-h-screen bg-navy text-slate-200">
      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
          <ScanSearch className="h-4 w-4" />
          Chrome Extension v0.2.0
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Detect AI Content<br />
          <span className="text-accent">As You Browse</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Baloney scans images and text on every page you visit, showing real-time AI detection
          badges and building your personal information diet score.
        </p>
      </section>

      {/* Works Everywhere Banner */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 rounded-2xl border border-accent/30 p-8 text-center">
          <Globe className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Works on Any Website</h2>
          <p className="text-slate-300">
            Instagram, X, Reddit, Facebook, TikTok, LinkedIn, Medium, news sites — Baloney runs everywhere.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-navy-light rounded-xl border border-navy-lighter p-5 hover:border-accent/30 transition"
            >
              <feature.icon className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Install Steps */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Install in 3 Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="bg-navy-light rounded-xl border border-navy-lighter p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent text-xl font-bold mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16 max-w-4xl mx-auto text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-blue-600 text-white font-semibold rounded-xl transition text-lg"
        >
          Open Dashboard
        </Link>
      </section>
    </main>
  );
}

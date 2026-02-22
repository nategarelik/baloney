"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Globe, X, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface SiteEntry {
  title: string;
  url: string;
}

// Sync: keep in sync with extension/background.js and extension/content.js allowedSites defaults
const DEFAULT_SITES: SiteEntry[] = [
  { title: "X (Twitter)", url: "x.com" },
  { title: "Twitter", url: "twitter.com" },
  { title: "LinkedIn", url: "linkedin.com" },
  { title: "Substack", url: "substack.com" },
  { title: "Reddit", url: "reddit.com" },
  { title: "Facebook", url: "facebook.com" },
  { title: "Instagram", url: "instagram.com" },
  { title: "Medium", url: "medium.com" },
  { title: "TikTok", url: "tiktok.com" },
  { title: "Threads", url: "threads.net" },
  { title: "Bluesky", url: "bsky.app" },
  { title: "Mastodon", url: "mastodon.social" },
  { title: "Hacker News", url: "news.ycombinator.com" },
];

function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/^www\./, "");
  domain = domain.replace(/\/.*$/, "");
  return domain;
}

function getTitleForDomain(domain: string): string {
  const match = DEFAULT_SITES.find((s) => s.url === domain);
  if (match) return match.title;
  // Capitalize first part of domain
  const parts = domain.split(".");
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

export default function AllowedSitesPage() {
  const [sites, setSites] = useState<SiteEntry[]>(DEFAULT_SITES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState("");
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Request sites from extension via custom events
  const requestSites = useCallback(() => {
    window.dispatchEvent(new CustomEvent("baloney-get-sites"));
  }, []);

  useEffect(() => {
    let connected = false;

    // Listen for sites response from extension content script
    function handleSitesResponse(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.sites && Array.isArray(detail.sites)) {
        connected = true;
        setExtensionConnected(true);
        setLoading(false);
        const entries: SiteEntry[] = detail.sites.map((url: string) => ({
          title: getTitleForDomain(url),
          url,
        }));
        setSites(entries);
      }
    }

    window.addEventListener("baloney-sites-response", handleSitesResponse);
    // Try to connect to extension
    requestSites();
    // Retry after short delays (content script may not be injected yet)
    const timer1 = setTimeout(requestSites, 500);
    const timer2 = setTimeout(requestSites, 1500);
    // If no response after all retries, stop loading and show defaults
    const loadingTimeout = setTimeout(() => {
      if (!connected) setLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener("baloney-sites-response", handleSitesResponse);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(loadingTimeout);
    };
  }, [requestSites]);

  function syncToExtension(newSites: SiteEntry[]) {
    const urls = newSites.map((s) => s.url);
    window.dispatchEvent(
      new CustomEvent("baloney-update-sites", { detail: { sites: urls } }),
    );
  }

  function handleAdd() {
    setEditIndex(null);
    setModalTitle("");
    setModalUrl("");
    setModalOpen(true);
  }

  function handleEdit(index: number) {
    setEditIndex(index);
    setModalTitle(sites[index].title);
    setModalUrl(sites[index].url);
    setModalOpen(true);
  }

  function handleDelete(index: number) {
    const updated = sites.filter((_, i) => i !== index);
    setSites(updated);
    syncToExtension(updated);
  }

  function handleSave() {
    const domain = normalizeDomain(modalUrl);
    if (!domain) return;

    const entry: SiteEntry = {
      title: modalTitle.trim() || getTitleForDomain(domain),
      url: domain,
    };

    let updated: SiteEntry[];
    if (editIndex !== null) {
      updated = sites.map((s, i) => (i === editIndex ? entry : s));
    } else {
      // Don't add duplicates
      if (sites.some((s) => s.url === domain)) {
        setModalOpen(false);
        return;
      }
      updated = [...sites, entry];
    }

    setSites(updated);
    syncToExtension(updated);
    setModalOpen(false);
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-4xl mx-auto px-6 py-12 page-top-offset">
        <h1 className="font-display text-4xl text-secondary mb-2">
          Allowed Websites
        </h1>
        <p className="text-secondary/50 mb-6">
          Baloney will only scan content on these websites.
        </p>

        {/* Disconnected banner */}
        {!loading && !extensionConnected && (
          <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-secondary/70">
              <span className="font-semibold text-secondary">
                Extension not connected
              </span>
              {
                " — changes won\u2019t take effect until the extension is installed. "
              }
              <Link
                href="/extension"
                className="text-primary underline hover:text-primary/80"
              >
                Install Baloney Extension
              </Link>
            </div>
          </div>
        )}

        {/* Grid of site cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-secondary/10 bg-base-dark p-5 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/8 shrink-0">
                    <div className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-secondary/8 rounded" />
                    <div className="h-3 w-32 bg-secondary/8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site, i) => (
              <div
                key={site.url}
                className="group relative bg-base-dark rounded-xl border border-secondary/10 p-5 transition-shadow hover:shadow-md"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(74,55,40,0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/5 shrink-0">
                    <Globe className="h-4 w-4 text-secondary/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base text-secondary truncate">
                      {site.title}
                    </h3>
                    <p className="text-xs text-secondary/50 truncate">
                      {site.url}
                    </p>
                  </div>
                </div>

                {/* Hover actions */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(i)}
                    className="p-1.5 rounded-md bg-secondary/5 hover:bg-secondary/10 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5 text-secondary/50" />
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-primary/70" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add new site card */}
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-secondary/15 p-5 text-secondary/40 hover:text-secondary/60 hover:border-secondary/25 transition-colors min-h-[88px]"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Website</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="w-full max-w-sm mx-4 rounded-xl border border-secondary/10 p-6"
            style={{ background: "#f0e6ca" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-secondary">
                {editIndex !== null ? "Edit Website" : "Add Website"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md hover:bg-secondary/10 transition-colors"
              >
                <X className="h-4 w-4 text-secondary/50" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-secondary/50 mb-1">
                  Website Title
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. My Blog"
                  className="w-full px-3 py-2 bg-base border border-secondary/10 rounded-lg text-sm text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary/50 mb-1">
                  URL / Domain
                </label>
                <input
                  type="text"
                  value={modalUrl}
                  onChange={(e) => setModalUrl(e.target.value)}
                  placeholder="e.g. example.com"
                  className="w-full px-3 py-2 bg-base border border-secondary/10 rounded-lg text-sm text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-secondary/60 rounded-full border border-secondary/15 hover:bg-secondary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!modalUrl.trim()}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed btn-primary-3d transition"
              >
                {editIndex !== null ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

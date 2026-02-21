"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { HandDrawnUnderline } from "@/components/HandDrawnUnderline";

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/tracker", label: "AI Tracker" },
] as const;

const CHROME_STORE_URL = "https://chromewebstore.google.com/";

export function Navbar() {
  const pathname = usePathname();

  return (
    /* Floating wrapper — positions bar centered with margin from top */
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-6">
      <nav
        className="w-full max-w-5xl flex items-center justify-between px-6 py-3 rounded-2xl"
        style={{
          background: "rgba(240, 230, 202, 0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          /* Beveled look: light top-left edge, dark bottom-right edge */
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.7) inset, " +
            "0 -1px 0 rgba(74,55,40,0.12) inset, " +
            "1px 0 0 rgba(255,255,255,0.5) inset, " +
            "-1px 0 0 rgba(74,55,40,0.08) inset, " +
            "0 4px 24px rgba(74,55,40,0.12), " +
            "0 1px 4px rgba(74,55,40,0.08)",
          border: "1px solid rgba(74,55,40,0.1)",
        }}
      >
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/baloney.png"
            alt="Baloney"
            className="h-9 w-9"
            style={{ mixBlendMode: "multiply" }}
          />
          <span className="font-display text-xl text-secondary">Baloney</span>
        </Link>

        {/* Nav Links + CTA */}
        <div className="flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-opacity pb-1",
                  isActive
                    ? "text-secondary opacity-100"
                    : "text-secondary/60 hover:text-secondary/90",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <HandDrawnUnderline width={link.label.length * 8} />
                  </span>
                )}
              </Link>
            );
          })}

          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 btn-primary-3d"
          >
            Get Baloney for Free
          </a>
        </div>
      </nav>
    </div>
  );
}

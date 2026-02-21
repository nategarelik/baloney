"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/feed", label: "Demo Feed" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-navy/90 backdrop-blur border-b border-navy-lighter">
      <Link href="/" className="flex items-center gap-2">
        <ScanSearch className="h-5 w-5 text-accent" />
        <span className="font-bold text-white">TrustLens</span>
      </Link>
      <div className="flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm transition",
              pathname === link.href
                ? "text-white font-medium"
                : "text-slate-400 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

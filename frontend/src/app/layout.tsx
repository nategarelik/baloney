import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustLens \u2014 AI Content Detection",
  description:
    "Detect AI-generated images, text, and video. Personal analytics dashboard with community intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy text-slate-200 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

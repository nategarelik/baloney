import type { Metadata } from "next";
import { Young_Serif, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const youngSerif = Young_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baloney — Tell What's Baloney",
  description:
    "Your all-purpose truth verifier. Detect AI-generated content across social media with the Baloney Chrome extension.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-base text-secondary antialiased font-body">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

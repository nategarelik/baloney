import type { Metadata } from "next";
import { Young_Serif, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/components/AuthProvider";
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
  title: "Baloney — Award-Winning AI Content Detector | 1st Place MAD Data 2026",
  description:
    "1st Place at MAD Data 2026. Detect AI-generated text, images, and video across social media with the Baloney Chrome extension. Real ML ensemble detection powered by RoBERTa, ViT, and more.",
  openGraph: {
    title: "Baloney — 1st Place MAD Data 2026",
    description:
      "Award-winning AI content detection platform. Chrome extension + analytics dashboard for detecting AI-generated content across social media.",
    siteName: "Baloney",
    type: "website",
    url: "https://trustlens-nu.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baloney — 1st Place MAD Data 2026",
    description:
      "Award-winning AI content detection. Chrome extension for real-time AI detection across social media.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-base text-secondary antialiased font-body">
        <AuthProvider>
          <Navbar />
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to the real domain at deploy time so social
  // share images resolve to absolute URLs.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://alejdi.xyz"),
  title: `${profile.name} — ${profile.role}`,
  description: profile.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full overflow-hidden bg-ink text-bone selection:bg-violet selection:text-ink">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "usly — your shared memory lane",
  description:
    "A private, invite-only memory lane for friends and family. Capture moments, write chapters, and send letters to the people who matter most.",
  keywords: ["family", "friends", "memories", "private", "invite-only", "photo album", "shared memories", "memory lane"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/logo-hd.png",
  },
  openGraph: {
    title: "usly — your shared memory lane",
    description: "A private, invite-only memory lane for friends and family. Capture moments, write chapters, and send letters.",
    type: "website",
    siteName: "usly",
  },
  twitter: {
    card: "summary_large_image",
    title: "usly — your shared memory lane",
    description: "A private, invite-only memory lane for friends and family.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#0b0b0b] text-[#f5f5f5]">
        {/* Restore deep-link path after GitHub Pages 404 redirect */}
        <script dangerouslySetInnerHTML={{ __html: `(function(l){if(l.search[1]=='/'){var d=l.search.slice(1).split('&').map(function(s){return s.replace(/~and~/g,'&')}).join('?');window.history.replaceState(null,null,l.pathname.slice(0,-1)+d+l.hash)}}(window.location))` }} />
        {children}
      </body>
    </html>
  );
}

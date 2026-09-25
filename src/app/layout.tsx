import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Texas Hold'em Poker Bet & Side Pot Calculator",
  description: "Realtime poker bet tracker, multi-player pot counter, and side pot splitter for live and home poker games.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="antialiased selection:bg-gold/20 selection:text-gold">
        {children}
      </body>
    </html>
  );
}

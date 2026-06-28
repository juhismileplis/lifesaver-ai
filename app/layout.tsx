import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeSaver AI - Your Proactive Productivity Companion",
  description:
    "Never miss a deadline again. LifeSaver AI proactively helps you plan, prioritize, and complete tasks before it's too late.",
  keywords: [
    "productivity",
    "AI assistant",
    "task management",
    "deadline tracker",
    "smart scheduling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

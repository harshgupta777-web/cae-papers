import type { Metadata } from "next";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Our Prep | College Papers, Answers & Important Questions",
  description:
    "Our Prep helps college students find previous papers, answer PDFs and important questions organised by university, college, branch, semester and subject.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5359862001191428"
          crossOrigin="anonymous"
        />
      </head>

      <body suppressHydrationWarning>
        <AnalyticsTracker />

        {children}

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
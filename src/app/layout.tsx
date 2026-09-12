import type { Metadata } from "next";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";

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
      <body suppressHydrationWarning>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
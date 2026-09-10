import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAE Papers | Papers, answers and important questions",
  description:
    "Previous year CAE papers, answer PDFs and important questions organised by university, college, branch, semester and subject.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);

  const wrap = dark
    ? "border-white/10 bg-[#0b1020]/80 text-white"
    : "border-slate-200 bg-white/80 text-slate-900";
  const link = dark
    ? "text-slate-300 hover:text-white"
    : "text-slate-600 hover:text-slate-900";

  return (
    <header
      className={
        "sticky top-0 z-50 border-b backdrop-blur-xl transition-colors " + wrap
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25">
            OP
          </span>

          <span className="text-[15px] font-semibold tracking-tight">
            Our Prep
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm sm:flex">
          <Link href="/search?type=paper" className={link}>
            Papers
          </Link>

          <Link href="/search?type=answer_pdf" className={link}>
            Answers
          </Link>

          <Link href="/search?type=important_questions" className={link}>
            Important questions
          </Link>

          <Link href="/search" className={link}>
            Browse all
          </Link>

          <Link
            href="/admin"
            className={
              dark
                ? "rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                : "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            Owner
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="text-sm font-medium sm:hidden"
          aria-label="Menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          className={
            "border-t px-5 py-3 text-sm sm:hidden " +
            (dark ? "border-white/10" : "border-slate-200")
          }
        >
          <div className="flex flex-col gap-3">
            <Link href="/search?type=paper" className={link}>
              Papers
            </Link>

            <Link href="/search?type=answer_pdf" className={link}>
              Answers
            </Link>

            <Link href="/search?type=important_questions" className={link}>
              Important questions
            </Link>

            <Link href="/search" className={link}>
              Browse all
            </Link>

            <Link href="/admin" className={link}>
              Owner login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
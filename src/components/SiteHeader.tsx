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
        "sticky top-0 z-50 border-b backdrop-blur-xl transition-colors " +
        wrap
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        
        {/* Logo + OurPrep */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/our-prep.png"
            alt="OurPrep"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop navigation */}
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

          {/* Contact Us */}
          <Link
            href="/contact"
            className={
              dark
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }
          >
            Contact Us
          </Link>

          {/* Owner */}
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

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="text-sm font-medium sm:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile navigation */}
      {open && (
        <div
          className={
            "border-t px-5 py-3 text-sm sm:hidden " +
            (dark ? "border-white/10" : "border-slate-200")
          }
        >
          <div className="flex flex-col gap-3">
            <Link
              href="/search?type=paper"
              className={link}
              onClick={() => setOpen(false)}
            >
              Papers
            </Link>

            <Link
              href="/search?type=answer_pdf"
              className={link}
              onClick={() => setOpen(false)}
            >
              Answers
            </Link>

            <Link
              href="/search?type=important_questions"
              className={link}
              onClick={() => setOpen(false)}
            >
              Important questions
            </Link>

            <Link
              href="/search"
              className={link}
              onClick={() => setOpen(false)}
            >
              Browse all
            </Link>

            <Link
              href="/contact"
              className={link}
              onClick={() => setOpen(false)}
            >
              Contact Us
            </Link>

            <Link
              href="/admin"
              className={link}
              onClick={() => setOpen(false)}
            >
              Owner login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
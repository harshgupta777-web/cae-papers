import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#0b1020] text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <img
                src="/our-prep.png"
                alt="OurPrep"
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Previous papers, answer PDFs and important questions, organised
              the way students actually search for them.
            </p>
          </div>

          {/* Material */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Material
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link
                href="/search?type=paper"
                className="transition-colors hover:text-white"
              >
                Question papers
              </Link>

              <Link
                href="/search?type=answer_pdf"
                className="transition-colors hover:text-white"
              >
                Answer PDFs
              </Link>

              <Link
                href="/search?type=important_questions"
                className="transition-colors hover:text-white"
              >
                Important questions
              </Link>

              <Link
                href="/search?type=notes"
                className="transition-colors hover:text-white"
              >
                Notes
              </Link>
            </div>
          </div>

          {/* Exams */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Exams
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link
                href="/search?exam=cae1"
                className="transition-colors hover:text-white"
              >
                CAE 1
              </Link>

              <Link
                href="/search?exam=cae2"
                className="transition-colors hover:text-white"
              >
                CAE 2
              </Link>

              <Link
                href="/search?exam=end_sem"
                className="transition-colors hover:text-white"
              >
                End semester
              </Link>

              <Link
                href="/search?exam=external"
                className="transition-colors hover:text-white"
              >
                External
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Connect
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link
                href="/contact"
                className="transition-colors hover:text-white"
              >
                Contact Us
              </Link>

              <a
                href="https://www.instagram.com/ourprep.in"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                Follow us on Instagram ↗
              </a>

              <a
                href="https://www.linkedin.com/company/ourprep"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                Follow us on LinkedIn ↗
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Terms of Use
              </Link>

              <Link
                href="/disclaimer"
                className="transition-colors hover:text-white"
              >
                Disclaimer
              </Link>

              <Link
                href="/copyright"
                className="transition-colors hover:text-white"
              >
                Copyright & Takedown
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-slate-500">
              Shared for study purposes only. All content is curated by the
              site owner.
            </p>

            

            <p className="text-xs text-slate-500">
              Built for students, by students.
            </p>

            <p className="text-xs text-slate-500">
              Online viewing + offline downloading
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
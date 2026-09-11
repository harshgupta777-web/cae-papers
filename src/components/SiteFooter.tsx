import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#0b1020] text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold text-white">
                CP
              </span>
              <span className="text-[15px] font-semibold text-white">
                Our Papers
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Previous papers, answer PDFs and important questions, organised the
              way students actually search for them.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Material
            </p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link href="/search?type=paper" className="hover:text-white">
                Question papers
              </Link>
              <Link href="/search?type=answer_pdf" className="hover:text-white">
                Answer PDFs
              </Link>
              <Link
                href="/search?type=important_questions"
                className="hover:text-white"
              >
                Important questions
              </Link>
              <Link href="/search?type=notes" className="hover:text-white">
                Notes
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Exams
            </p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link href="/search?exam=cae1" className="hover:text-white">
                CAE 1
              </Link>
              <Link href="/search?exam=cae2" className="hover:text-white">
                CAE 2
              </Link>
              <Link href="/search?exam=end_sem" className="hover:text-white">
                End semester
              </Link>
              <Link href="/search?exam=external" className="hover:text-white">
                External
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            Shared for study purposes only. All content is curated by the site
            owner.
          </p>
          <p className="text-xs text-slate-500">View online only</p>
        </div>
      </div>
    </footer>
  );
}

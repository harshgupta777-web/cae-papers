"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, MATERIAL_TYPES, EXAM_TYPES, labelOf } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Row = Record<string, any>;

const SELECT =
  "id, title, material_type, exam_type, academic_year, view_count, created_at, subject_id, subjects!materials_subject_id_fkey(id, name, subject_code)";

function Results() {
  const params = useSearchParams();
  const router = useRouter();

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const exam = params.get("exam") ?? "";
  const subject = params.get("subject") ?? "";
  const semester = params.get("semester") ?? "";
  const branch = params.get("branch") ?? "";
  const college = params.get("college") ?? "";
  const university = params.get("university") ?? "";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest");
  const [term, setTerm] = useState(q);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");

      let subjectIds: string[] | null = null;

      if (subject) {
        subjectIds = [subject];
      } else if (semester) {
        const { data } = await supabase
          .from("subjects")
          .select("id")
          .eq("semester_id", semester);
        subjectIds = (data ?? []).map((r: Row) => r.id);
      } else if (branch) {
        const { data: sems } = await supabase
          .from("semesters")
          .select("id")
          .eq("branch_id", branch);
        const semIds = (sems ?? []).map((r: Row) => r.id);
        if (semIds.length === 0) subjectIds = [];
        else {
          const { data } = await supabase
            .from("subjects")
            .select("id")
            .in("semester_id", semIds);
          subjectIds = (data ?? []).map((r: Row) => r.id);
        }
      } else if (college || university) {
        let branchIds: string[] = [];
        if (college) {
          const { data } = await supabase
            .from("branches")
            .select("id")
            .eq("college_id", college);
          branchIds = (data ?? []).map((r: Row) => r.id);
        } else {
          const { data: cols } = await supabase
            .from("colleges")
            .select("id")
            .eq("university_id", university);
          const colIds = (cols ?? []).map((r: Row) => r.id);
          if (colIds.length > 0) {
            const { data } = await supabase
              .from("branches")
              .select("id")
              .in("college_id", colIds);
            branchIds = (data ?? []).map((r: Row) => r.id);
          }
        }

        if (branchIds.length === 0) subjectIds = [];
        else {
          const { data: sems } = await supabase
            .from("semesters")
            .select("id")
            .in("branch_id", branchIds);
          const semIds = (sems ?? []).map((r: Row) => r.id);
          if (semIds.length === 0) subjectIds = [];
          else {
            const { data } = await supabase
              .from("subjects")
              .select("id")
              .in("semester_id", semIds);
            subjectIds = (data ?? []).map((r: Row) => r.id);
          }
        }
      }

      let textSubjectIds: string[] = [];
      if (q) {
        const { data } = await supabase
          .from("subjects")
          .select("id")
          .or("name.ilike.%" + q + "%,subject_code.ilike.%" + q + "%");
        textSubjectIds = (data ?? []).map((r: Row) => r.id);
      }

      let query = supabase
        .from("materials")
        .select(SELECT)
        .eq("is_published", true)
        .limit(100);

      if (subjectIds !== null) {
        if (subjectIds.length === 0) {
          setRows([]);
          setLoading(false);
          return;
        }
        query = query.in("subject_id", subjectIds);
      }

      if (type) query = query.eq("material_type", type);
      if (exam) query = query.eq("exam_type", exam);

      if (q) {
        const parts = ["title.ilike.%" + q + "%"];
        if (textSubjectIds.length > 0)
          parts.push("subject_id.in.(" + textSubjectIds.join(",") + ")");
        query = query.or(parts.join(","));
      }

      if (sort === "newest")
        query = query.order("created_at", { ascending: false });
      else if (sort === "oldest")
        query = query.order("created_at", { ascending: true });
      else query = query.order("view_count", { ascending: false });

      const { data, error: err } = await query;
      if (err) setError(err.message);
      setRows(data ?? []);
      setLoading(false);
    }

    run();
  }, [q, type, exam, subject, semester, branch, college, university, sort]);

  const heading = q
    ? "Results for " + q
    : type
    ? labelOf(MATERIAL_TYPES, type)
    : exam
    ? labelOf(EXAM_TYPES, exam)
    : "All materials";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(term.trim() ? "/search?q=" + encodeURIComponent(term.trim()) : "/search");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-10">
            <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Searching..."
                : rows.length + " material" + (rows.length === 1 ? "" : "s") + " found"}
            </p>

            <form onSubmit={submit} className="mt-6 flex max-w-xl gap-2">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search paper code or subject"
                className="field"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/search"
                className={
                  "rounded-full border px-3.5 py-1.5 text-xs transition " +
                  (!type
                    ? "border-[#0b1020] bg-[#0b1020] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400")
                }
              >
                All
              </Link>
              {MATERIAL_TYPES.map((m) => (
                <Link
                  key={m.value}
                  href={"/search?type=" + m.value}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-xs transition " +
                    (type === m.value
                      ? "border-[#0b1020] bg-[#0b1020] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400")
                  }
                >
                  {m.label}
                </Link>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field max-w-[180px]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="popular">Most viewed</option>
            </select>
          </div>

          {error && (
            <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading && (
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          )}

          {!loading && rows.length === 0 && !error && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold">Nothing here yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Try a subject name or paper code, or browse step by step from
                the homepage.
              </p>
              <Link href="/" className="btn-primary mt-7 inline-block">
                Back to home
              </Link>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <ul className="mt-8 space-y-3">
              {rows.map((m) => (
                <li key={m.id}>
                  <Link
                    href={"/view/" + m.id}
                    className="lift block rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold">{m.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {m.subjects?.name}
                          {m.subjects?.subject_code
                            ? " - " + m.subjects.subject_code
                            : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                          {labelOf(MATERIAL_TYPES, m.material_type)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                          {labelOf(EXAM_TYPES, m.exam_type)}
                        </span>
                        {m.academic_year && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                            {m.academic_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading...
        </div>
      }
    >
      <Results />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, MATERIAL_TYPES, labelOf } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { trackEvent } from "@/lib/analytics";

type Row = Record<string, any>;

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSlug(value: string | null | undefined) {
  return normalize(value)
    .replace(/[\s-]+/g, "")
    .replace(/^seassonal/, "seasonal");
}

function academicYearMatches(value: string | null | undefined, requested: string) {
  if (!requested) return true;
  if (!value) return false;
  const actual = normalize(value).replace(/\//g, "-");
  const wanted = normalize(requested).replace(/\//g, "-");
  if (actual === wanted) return true;
  if (/^20\d{2}$/.test(wanted)) return actual.startsWith(wanted + "-") || actual === wanted;
  const parts = wanted.split("-");
  if (parts.length === 2) {
    const end = actual.split("-")[1] ?? "";
    return actual.startsWith(parts[0] + "-") && (end === parts[1] || end.endsWith(parts[1]));
  }
  return actual.includes(wanted);
}

function humanizeAssessment(slug: string | null | undefined, name?: string | null) {
  if (name) return name;
  const known: Record<string, string> = { cae1: "CAE 1", cae2: "CAE 2", ct1: "CT 1", ct2: "CT 2", internal: "Internal", put: "PUT", mid_sem: "Mid Semester", end_sem: "End Semester", practical: "Practical", assignment: "Assignment" };
  const key = String(slug ?? "").toLowerCase();
  return known[key] ?? String(slug ?? "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function materialTypeFromQuery(q: string) {
  const n = normalize(q);
  if (/\b(pyq|previous year|question paper|question papers)\b/.test(n)) return "paper";
  if (/\b(answer|answers|solution|solutions|answer pdf)\b/.test(n)) return "answer_pdf";
  if (/\b(important question|important questions)\b/.test(n)) return "important_questions";
  if (/\b(notes|note)\b/.test(n)) return "notes";
  if (/\bsyllabus\b/.test(n)) return "syllabus";
  if (/\b(practical|lab)\b/.test(n)) return "practical";
  return "";
}

function detectAcademicYear(q: string) {
  return normalize(q).match(/\b20\d{2}(?:[-/]20?\d{2})?\b/)?.[0] ?? "";
}

function rowText(row: Row) {
  return normalize([
    row.title, row.subject_name, row.subject_code, row.assessment_name, row.exam_type,
    row.college_name, row.college_short_name, row.university_name, row.university_short_name,
    row.course_name, row.course_short_name, row.branch_name, row.branch_short_name,
    row.semester_name, row.academic_year, row.material_type,
  ].filter(Boolean).join(" "));
}

function rowMatchesFilter(row: Row, params: { type: string; exam: string; subject: string; semester: string; branch: string; college: string; university: string; year: string; commonFirstYear: boolean }) {
  if (params.type && row.material_type !== params.type) return false;
  if (params.exam && cleanSlug(row.exam_type) !== cleanSlug(params.exam)) return false;
  if (params.subject && row.subject_id !== params.subject) return false;
  if (params.semester && String(row.semester_id) !== params.semester && String(row.semester_number) !== params.semester) return false;
  if (params.branch && row.branch_id !== params.branch) return false;
  if (params.college && row.college_id !== params.college) return false;
  if (params.university && row.university_id !== params.university) return false;
  if (params.year && Number(row.study_year ?? row.year_number) !== Number(params.year)) return false;
  if (params.commonFirstYear && !row.is_common_first_year) return false;
  return true;
}

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
  const year = params.get("year") ?? "";
  const commonFirstYear = params.get("common_first_year") === "1";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("relevance");
  const [term, setTerm] = useState(q);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const raw = q.trim();
        const detectedType = type || materialTypeFromQuery(raw);
        const requestedYear = detectAcademicYear(raw);
        const rpcQuery = raw || "";

        // Primary search: one database RPC. It already returns the complete
        // University -> College -> Course -> Branch -> Study Year -> Subject
        // -> Assessment hierarchy, so the browser does not need to perform
        // fragile multi-table discovery or raw .or() filters.
        const { data, error: rpcError } = await supabase.rpc("search_ourprep_v6", {
          search_query: rpcQuery,
          result_limit: 200,
        });

        if (rpcError) throw rpcError;

        let resultRows = ((data ?? []) as Row[]).filter(row => row.is_published !== false);

        // Apply explicit URL filters after the relevance-ranked RPC result.
        resultRows = resultRows.filter(row => rowMatchesFilter(row, {
          type: detectedType, exam, subject, semester, branch, college, university, year, commonFirstYear,
        }));

        if (requestedYear) {
          resultRows = resultRows.filter(row => academicYearMatches(row.academic_year, requestedYear));
        }

        // The RPC is the source of ranking. Keep that ranking for the default
        // view and only override it when the user explicitly chooses a sort.
        if (sort === "newest") {
          resultRows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
        } else if (sort === "oldest") {
          resultRows.sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));
        } else if (sort === "popular") {
          resultRows.sort((a, b) => Number(b.view_count ?? 0) - Number(a.view_count ?? 0));
        } else {
          resultRows.sort((a, b) => Number(b.relevance ?? 0) - Number(a.relevance ?? 0));
        }

        // Defensive fallback for an older RPC deployment: if the RPC returns
        // no rows for an empty search, load published materials directly.
       

        if (raw) {
          trackEvent({ event_type: "search", search_query: raw, result_count: resultRows.length, page_path: "/search" });
        }

        if (!cancelled) {
          setRows(resultRows);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Search failed. Please try again.");
          setRows([]);
          setLoading(false);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [q, type, exam, subject, semester, branch, college, university, year, commonFirstYear, sort]);

  const heading = useMemo(() => {
    if (q) return `Results for ${q}`;
    if (type) return labelOf(MATERIAL_TYPES, type);
    if (exam) return humanizeAssessment(exam);
    return "All materials";
  }, [q, type, exam]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : "/search");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              {heading}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Searching..."
                : `${rows.length} material${
                    rows.length === 1
                      ? ""
                      : "s"
                  } found`}
            </p>

            <form
              onSubmit={submit}
              className="mt-6 flex max-w-2xl gap-2"
            >
              <input
                value={term}
                onChange={(e) =>
                  setTerm(e.target.value)
                }
                placeholder="Search college, branch, subject, assessment or paper..."
                className="field"
              />

              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-400">
              Try: GCET CAE1 maths 2024 · DGI CT1
              CSE 2024 · 1st year maths · CSE PYQ
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-8">
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

              {MATERIAL_TYPES.map(
                (material) => (
                  <Link
                    key={material.value}
                    href={
                      "/search?type=" +
                      material.value
                    }
                    className={
                      "rounded-full border px-3.5 py-1.5 text-xs transition " +
                      (type ===
                      material.value
                        ? "border-[#0b1020] bg-[#0b1020] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400")
                    }
                  >
                    {material.label}
                  </Link>
                )
              )}
            </div>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="field max-w-[180px]"
            >
              <option value="relevance">
                Most relevant
              </option>

              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="popular">
                Most viewed
              </option>
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
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          )}

          {!loading &&
            rows.length === 0 &&
            !error && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
                <p className="text-base font-semibold">
                  Nothing here yet
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Try a subject, college,
                  branch, assessment or paper
                  code.
                </p>

                <p className="mx-auto mt-2 max-w-lg text-xs text-slate-400">
                  Example: GCET CAE1 maths
                  2024, DGI CT1 CSE 2024,
                  Galgotias DBMS, or CSE PYQ.
                </p>

                <Link
                  href="/"
                  className="btn-primary mt-7 inline-block"
                >
                  Back to home
                </Link>
              </div>
            )}

          {!loading &&
            rows.length > 0 && (
              <ul className="mt-8 space-y-3">
                {rows.map((material) => {
                  const assessmentLabel =
                    material.assessment_name ??
                    humanizeAssessment(material.exam_type);

                  const studyYear = material.study_year ?? material.year_number ?? null;
                  const hierarchy = [
                    material.university_short_name || material.university_name,
                    material.college_short_name || material.college_name,
                    material.course_short_name || material.course_name,
                    material.branch_short_name || material.branch_name,
                    studyYear
                      ? `${studyYear}${studyYear === 1 ? "st" : studyYear === 2 ? "nd" : studyYear === 3 ? "rd" : "th"} Year`
                      : null,
                  ].filter(Boolean);

                  return (
                    <li key={material.id}>
                      <Link
                        href={
                          "/view/" +
                          material.id
                        }
                        className="lift block rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold">
                              {material.title}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {material.subject_name ?? "Subject"}
                              {material.subject_code
                                ? ` — ${material.subject_code}`
                                : ""}
                            </p>

                            {hierarchy.length >
                              0 && (
                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {hierarchy.join(
                                  " • "
                                )}
                              </p>
                            )}

                            {material.semester_name && (
                              <p className="mt-1 text-xs text-slate-400">
                                {material.semester_name}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap justify-end gap-2">
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                              {labelOf(
                                MATERIAL_TYPES,
                                material.material_type
                              )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                              {assessmentLabel}
                            </span>

                            {material.academic_year && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                                {
                                  material.academic_year
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
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

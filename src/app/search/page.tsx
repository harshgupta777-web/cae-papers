"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  supabase,
  MATERIAL_TYPES,
  EXAM_TYPES,
  labelOf,
} from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { trackEvent } from "@/lib/analytics";

type Row = Record<string, any>;

const SELECT =
  "id, title, material_type, exam_type, academic_year, view_count, created_at, subject_id, is_common_first_year, subjects!materials_subject_id_fkey(id, name, subject_code)";

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
  const [sort, setSort] = useState("newest");
  const [term, setTerm] = useState(q);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const raw = q.trim();
        const normalized = raw
          .toLowerCase()
          .replace(/[–—]/g, "-")
          .replace(/\s+/g, " ")
          .trim();

        // ------------------------------------------------------------
        // Parse the student's natural search wording.
        // Examples:
        // "CAE paper physics sem 1"
        // "physics 1st year"
        // "sem 1 physics"
        // "physics cae1 2024"
        // ------------------------------------------------------------
        const semesterNumbers = new Set<number>();

        const semesterMatches = normalized.matchAll(
          /\b(?:sem|semester)\s*[-:]?\s*([1-8])\b/g
        );

        for (const match of semesterMatches) {
          semesterNumbers.add(Number(match[1]));
        }

        const yearPatterns: Array<[RegExp, number]> = [
          [/\b(?:1st|1|first)\s*year\b/, 1],
          [/\b(?:2nd|2|second)\s*year\b/, 2],
          [/\b(?:3rd|3|third)\s*year\b/, 3],
          [/\b(?:4th|4|fourth)\s*year\b/, 4],
        ];

        for (const [pattern, year] of yearPatterns) {
          if (pattern.test(normalized)) {
            semesterNumbers.add(year * 2 - 1);
            semesterNumbers.add(year * 2);
            break;
          }
        }

        // Also understand shorthand such as "s1" / "s 1".
        const shortSemester = normalized.match(/\bs\s*([1-8])\b/);
        if (shortSemester) semesterNumbers.add(Number(shortSemester[1]));

        // Exam aliases.
        let detectedExam = exam;

        if (!detectedExam) {
          if (/\bcae\s*1\b|\bcae1\b/.test(normalized))
            detectedExam = "cae1";
          else if (/\bcae\s*2\b|\bcae2\b/.test(normalized))
            detectedExam = "cae2";
          else if (/\bmid\s*[- ]?sem(?:ester)?\b/.test(normalized))
            detectedExam = "mid_sem";
          else if (/\bend\s*[- ]?sem(?:ester)?\b/.test(normalized))
            detectedExam = "end_sem";
          else if (/\bexternal\b/.test(normalized))
            detectedExam = "external";
          else if (/\binternal\b/.test(normalized))
            detectedExam = "internal";
          else if (/\bpractical\b/.test(normalized))
            detectedExam = "practical";
          else if (/\bassignment\b/.test(normalized))
            detectedExam = "assignment";
        }

        // Material aliases.
        let detectedType = type;

        if (!detectedType) {
          if (
            /\bquestion\s*paper\b|\bquestion\s*papers\b/.test(normalized)
          ) {
            detectedType = "paper";
          } else if (
            /\banswer(?:s)?\b|\bsolution(?:s)?\b/.test(normalized)
          ) {
            detectedType = "answer_pdf";
          } else if (
            /\bimportant\s*questions?\b/.test(normalized)
          ) {
            detectedType = "important_questions";
          } else if (/\bnotes?\b/.test(normalized)) {
            detectedType = "notes";
          } else if (/\bsyllabus\b/.test(normalized)) {
            detectedType = "syllabus";
          } else if (/\bpractical\b|\blab\b/.test(normalized)) {
            detectedType = "practical";
          }
        }

        // Academic year, e.g. "2024" or "2024-25".
        const academicYearMatch = normalized.match(
          /\b(20\d{2}(?:[-/]\d{2,4})?)\b/
        );
        const detectedAcademicYear = academicYearMatch?.[1] ?? "";

        const stopWords = new Set([
          "a",
          "an",
          "the",
          "for",
          "of",
          "in",
          "on",
          "to",
          "and",
          "or",
          "show",
          "find",
          "give",
          "me",
          "please",
          "want",
          "need",
          "all",
          "get",
          "search",
          "looking",
          "look",
          "with",
          "from",
          "my",
          "paper",
          "papers",
          "question",
          "questions",
          "questionpaper",
          "questionpapers",
          "answer",
          "answers",
          "solution",
          "solutions",
          "notes",
          "note",
          "syllabus",
          "practical",
          "lab",
          "cae",
          "mid",
          "semester",
          "sem",
          "year",
          "first",
          "second",
          "third",
          "fourth",
          "1st",
          "2nd",
          "3rd",
          "4th",
          "external",
          "internal",
          "assignment",
        ]);

        const tokens = normalized
          .replace(/[^a-z0-9\s-]/g, " ")
          .split(/\s+/)
          .map((token) => token.trim())
          .filter(Boolean);

        const textTokens = tokens.filter((token) => {
          if (stopWords.has(token)) return false;
          if (/^\d+$/.test(token)) return false;
          if (/^cae\d$/.test(token)) return false;
          if (/^s\d$/.test(token)) return false;
          if (/^20\d{2}(?:[-/]\d{2,4})?$/.test(token)) return false;
          return token.length >= 2;
        });

        // ------------------------------------------------------------
        // Resolve the hierarchy selected through URL filters.
        // ------------------------------------------------------------
        let navigationSubjectIds: string[] | null = null;

        if (subject) {
          navigationSubjectIds = [subject];
        } else if (semester) {
          const { data, error: subjectError } = await supabase
            .from("subjects")
            .select("id")
            .eq("semester_id", semester);

          if (subjectError) throw subjectError;

          navigationSubjectIds = (data ?? []).map((r: Row) => r.id);
        } else if (branch) {
          let semQuery = supabase
            .from("semesters")
            .select("id")
            .eq("branch_id", branch);

          if (year) {
            semQuery = semQuery.eq("year_number", Number(year));
          }

          const { data: sems, error: semError } = await semQuery;

          if (semError) throw semError;

          const semIds = (sems ?? []).map((r: Row) => r.id);

          if (semIds.length === 0) {
            navigationSubjectIds = [];
          } else {
            const { data, error: subjectError } = await supabase
              .from("subjects")
              .select("id")
              .in("semester_id", semIds);

            if (subjectError) throw subjectError;

            navigationSubjectIds = (data ?? []).map((r: Row) => r.id);
          }
        } else if (college || university) {
          let branchIds: string[] = [];

          if (college) {
            const { data, error: branchError } = await supabase
              .from("branches")
              .select("id")
              .eq("college_id", college);

            if (branchError) throw branchError;

            branchIds = (data ?? []).map((r: Row) => r.id);
          } else {
            const { data: cols, error: collegeError } = await supabase
              .from("colleges")
              .select("id")
              .eq("university_id", university);

            if (collegeError) throw collegeError;

            const colIds = (cols ?? []).map((r: Row) => r.id);

            if (colIds.length > 0) {
              const { data, error: branchError } = await supabase
                .from("branches")
                .select("id")
                .in("college_id", colIds);

              if (branchError) throw branchError;

              branchIds = (data ?? []).map((r: Row) => r.id);
            }
          }

          if (branchIds.length === 0) {
            navigationSubjectIds = [];
          } else {
            let semQuery = supabase
              .from("semesters")
              .select("id")
              .in("branch_id", branchIds);

            if (year) {
              semQuery = semQuery.eq("year_number", Number(year));
            }

            const { data: sems, error: semError } = await semQuery;

            if (semError) throw semError;

            const semIds = (sems ?? []).map((r: Row) => r.id);

            if (semIds.length === 0) {
              navigationSubjectIds = [];
            } else {
              const { data, error: subjectError } = await supabase
                .from("subjects")
                .select("id")
                .in("semester_id", semIds);

              if (subjectError) throw subjectError;

              navigationSubjectIds = (data ?? []).map((r: Row) => r.id);
            }
          }
        }

        // ------------------------------------------------------------
        // Resolve semester/year from natural language.
        // ------------------------------------------------------------
        let naturalSemesterSubjectIds: string[] | null = null;

        if (semesterNumbers.size > 0) {
          let semesterQuery = supabase
            .from("semesters")
            .select("id")
            .in(
              "semester_number",
              Array.from(semesterNumbers)
            );

          if (branch) {
            semesterQuery = semesterQuery.eq("branch_id", branch);
          }

          if (year) {
            semesterQuery = semesterQuery.eq(
              "year_number",
              Number(year)
            );
          }

          const {
            data: sems,
            error: semesterError,
          } = await semesterQuery;

          if (semesterError) throw semesterError;

          const semIds = (sems ?? []).map((r: Row) => r.id);

          if (semIds.length === 0) {
            naturalSemesterSubjectIds = [];
          } else {
            const { data, error: subjectError } = await supabase
              .from("subjects")
              .select("id")
              .in("semester_id", semIds);

            if (subjectError) throw subjectError;

            naturalSemesterSubjectIds = (data ?? []).map(
              (r: Row) => r.id
            );
          }
        }

        // ------------------------------------------------------------
        // Find subjects using each meaningful word.
        // ------------------------------------------------------------
        let textSubjectIds: string[] = [];

        if (textTokens.length > 0) {
          const subjectParts: string[] = [];

          for (const token of textTokens.slice(0, 8)) {
            subjectParts.push("name.ilike.%" + token + "%");
            subjectParts.push(
              "subject_code.ilike.%" + token + "%"
            );
          }

          const { data, error: subjectError } = await supabase
            .from("subjects")
            .select("id")
            .or(subjectParts.join(","));

          if (subjectError) throw subjectError;

          textSubjectIds = (data ?? []).map((r: Row) => r.id);
        }

        // If the query contains both a subject and semester/year,
        // intersect those sets.
        let resolvedSubjectIds: string[] | null = null;

        if (textTokens.length > 0) {
          resolvedSubjectIds = textSubjectIds;
        }

        if (naturalSemesterSubjectIds !== null) {
          resolvedSubjectIds =
            resolvedSubjectIds === null
              ? naturalSemesterSubjectIds
              : resolvedSubjectIds.filter((id) =>
                  naturalSemesterSubjectIds!.includes(id)
                );
        }

        if (navigationSubjectIds !== null) {
          resolvedSubjectIds =
            resolvedSubjectIds === null
              ? navigationSubjectIds
              : resolvedSubjectIds.filter((id) =>
                  navigationSubjectIds!.includes(id)
                );
        }

        // A common first-year paper is intentionally not tied
        // to the student's selected branch.
        if (commonFirstYear) {
          resolvedSubjectIds = null;
        }

        // ------------------------------------------------------------
        // Build the material query.
        // ------------------------------------------------------------
        let query = supabase
          .from("materials")
          .select(SELECT)
          .eq("is_published", true)
          .limit(100);

        if (commonFirstYear) {
          query = query.eq("is_common_first_year", true);
        }

        if (detectedType) {
          query = query.eq("material_type", detectedType);
        }

        if (detectedExam) {
          query = query.eq("exam_type", detectedExam);
        }

        if (detectedAcademicYear) {
          query = query.ilike(
            "academic_year",
            "%" + detectedAcademicYear + "%"
          );
        }

        if (!commonFirstYear) {
          if (resolvedSubjectIds !== null) {
            if (resolvedSubjectIds.length === 0) {
              if (!cancelled) {
                setRows([]);
                setLoading(false);
              }

              return;
            }

            query = query.in(
              "subject_id",
              resolvedSubjectIds
            );
          } else if (navigationSubjectIds !== null) {
            if (navigationSubjectIds.length === 0) {
              if (!cancelled) {
                setRows([]);
                setLoading(false);
              }

              return;
            }

            query = query.in(
              "subject_id",
              navigationSubjectIds
            );
          }
        }

        // If no subject was found, fall back to title searching.
        if (
          textTokens.length > 0 &&
          textSubjectIds.length === 0
        ) {
          const titleParts = textTokens
            .slice(0, 8)
            .map(
              (token) => "title.ilike.%" + token + "%"
            );

          query = query.or(titleParts.join(","));
        }

        if (sort === "newest") {
          query = query.order("created_at", {
            ascending: false,
          });
        } else if (sort === "oldest") {
          query = query.order("created_at", {
            ascending: true,
          });
        } else {
          query = query.order("view_count", {
            ascending: false,
          });
        }

        const { data, error: err } = await query;

        if (err) throw err;

        const resultCount = data?.length ?? 0;

        // Record the search only when the student actually
        // entered a search term.
        if (raw.trim()) {
          trackEvent({
            event_type: "search",
            search_query: raw.trim(),
            result_count: resultCount,
            page_path: "/search",
          });
        }

        if (!cancelled) {
          setRows(data ?? []);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message ??
              "Search failed. Please try again."
          );
          setRows([]);
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [
    q,
    type,
    exam,
    subject,
    semester,
    branch,
    college,
    university,
    year,
    commonFirstYear,
    sort,
  ]);

  const heading = q
    ? "Results for " + q
    : type
    ? labelOf(MATERIAL_TYPES, type)
    : exam
    ? labelOf(EXAM_TYPES, exam)
    : "All materials";

  function submit(e: React.FormEvent) {
    e.preventDefault();

    router.push(
      term.trim()
        ? "/search?q=" +
            encodeURIComponent(term.trim())
        : "/search"
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              {heading}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Searching..."
                : rows.length +
                  " material" +
                  (rows.length === 1 ? "" : "s") +
                  " found"}
            </p>

            <form
              onSubmit={submit}
              className="mt-6 flex max-w-xl gap-2"
            >
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search paper code or subject"
                className="field"
              />

              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
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

          {!loading &&
            rows.length === 0 &&
            !error && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
                <p className="text-base font-semibold">
                  Nothing here yet
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Try a subject name or paper code, or
                  browse step by step from the homepage.
                </p>

                <Link
                  href="/"
                  className="btn-primary mt-7 inline-block"
                >
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
                        <p className="text-[15px] font-semibold">
                          {m.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {m.subjects?.name}
                          {m.subjects?.subject_code
                            ? " - " +
                              m.subjects.subject_code
                            : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                          {labelOf(
                            MATERIAL_TYPES,
                            m.material_type
                          )}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                          {labelOf(
                            EXAM_TYPES,
                            m.exam_type
                          )}
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
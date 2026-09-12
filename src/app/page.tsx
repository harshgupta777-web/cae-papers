"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, MATERIAL_TYPES, EXAM_TYPES, labelOf } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Row = Record<string, any>;

const CARDS = [
  {
    type: "paper",
    title: "Question papers",
    desc: "CAE 1, CAE 2, end semester and external papers, year by year.",
  },
  {
    type: "answer_pdf",
    title: "Answer PDFs",
    desc: "Written solutions to match the papers you are practising.",
  },
  {
    type: "important_questions",
    title: "Important questions",
    desc: "The repeated and most expected questions for focused exam preparation.",
  },
  {
    type: "notes",
    title: "Notes",
    desc: "Unit wise notes for quick revision before the exam.",
  },
  {
    type: "syllabus",
    title: "Syllabus",
    desc: "Know exactly what is in scope for each subject.",
  },
  {
    type: "practical",
    title: "Practical files",
    desc: "Lab work and practical records for your semester.",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [q, setQ] = useState("");

  const [universities, setUniversities] = useState<Row[]>([]);
  const [colleges, setColleges] = useState<Row[]>([]);
  const [branches, setBranches] = useState<Row[]>([]);
  const [semesters, setSemesters] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<Row[]>([]);

  const [uniId, setUniId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [isBtech, setIsBtech] = useState(false);
  const [years, setYears] = useState<number[]>([]);
  const [yearNumber, setYearNumber] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [commonFirstYear, setCommonFirstYear] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [examType, setExamType] = useState("");

  const [recent, setRecent] = useState<Row[]>([]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from("universities")
        .select("id, name, short_name")
        .eq("is_active", true)
        .order("name");
      setUniversities(data ?? []);

      const { data: latest } = await supabase
        .from("materials")
        .select(
          "id, title, material_type, exam_type, academic_year, subjects!materials_subject_id_fkey(name, subject_code)"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      setRecent(latest ?? []);
    }
    init();
  }, []);

  useEffect(() => {
    setCollegeId("");
    setBranchId("");
    setSemesterId("");
    setSubjectId("");
    setBranches([]);
    setSemesters([]);
    setSubjects([]);
    if (!uniId) return setColleges([]);
    supabase
      .from("colleges")
      .select("id, name, city")
      .eq("university_id", uniId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setColleges(data ?? []));
  }, [uniId]);

  useEffect(() => {
    setBranchId("");
    setSemesterId("");
    setSubjectId("");
    setSemesters([]);
    setSubjects([]);
    if (!collegeId) return setBranches([]);
    supabase
      .from("branches")
      .select("id, name, course_id")
      .eq("college_id", collegeId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setBranches(data ?? []));
  }, [collegeId]);

  useEffect(() => {
    setSemesterId("");
    setYearNumber("");
    setSubjectId("");
    setSubjects([]);
    setYears([]);
    setCommonFirstYear(false);

    if (!branchId) {
      setSemesters([]);
      setIsBtech(false);
      return;
    }

    const selectedBranch = branches.find((b) => b.id === branchId);
    const btech =
      selectedBranch?.course_id ===
      "06b26861-845e-4c61-9a50-815947500594";
    setIsBtech(Boolean(btech));

    supabase
      .from("semesters")
      .select("id, name, semester_number, year_number")
      .eq("branch_id", branchId)
      .eq("is_active", true)
      .order("semester_number")
      .then(({ data }) => {
        const next = data ?? [];
        setSemesters(next);

        if (btech) {
          const yearValues: number[] = next
            .map((r: Row) => Number(r.year_number))
            .filter((n: number) => n >= 1 && n <= 4);
          const uniqueYears: number[] = Array.from(new Set<number>(yearValues)).sort(
            (a, b) => a - b
          );
          setYears(uniqueYears);
        }
      });
  }, [branchId, branches]);

  useEffect(() => {
    setSubjectId("");
    if (!isBtech) {
      if (!semesterId) return setSubjects([]);
      supabase
        .from("subjects")
        .select("id, name, subject_code")
        .eq("semester_id", semesterId)
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => setSubjects(data ?? []));
      return;
    }

    if (!yearNumber || !branchId) return setSubjects([]);

    const year = Number(yearNumber);
    const yearSemesters = semesters.filter(
      (r: Row) => Number(r.year_number) === year
    );
    const semIds = yearSemesters.map((r: Row) => r.id);

    if (semIds.length === 0) return setSubjects([]);

    supabase
      .from("subjects")
      .select("id, name, subject_code")
      .in("semester_id", semIds)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setSubjects(data ?? []));
  }, [isBtech, yearNumber, semesterId, branchId, semesters]);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push("/search?q=" + encodeURIComponent(q.trim()));
  }

  function runFilters() {
    const params = new URLSearchParams();

    if (isBtech) {
      if (yearNumber) params.set("year", yearNumber);

      if (commonFirstYear && yearNumber === "1") {
        params.set("common_first_year", "1");
      } else if (subjectId) {
        params.set("subject", subjectId);
      } else if (branchId) {
        params.set("branch", branchId);
      } else if (collegeId) {
        params.set("college", collegeId);
      } else if (uniId) {
        params.set("university", uniId);
      }
    } else {
      if (subjectId) params.set("subject", subjectId);
      else if (semesterId) params.set("semester", semesterId);
      else if (branchId) params.set("branch", branchId);
      else if (collegeId) params.set("college", collegeId);
      else if (uniId) params.set("university", uniId);
    }

    if (examType) params.set("exam", examType);
    router.push("/search?" + params.toString());
  }

  const steps = [
    {
      n: 1,
      label: "University",
      value: uniId,
      set: setUniId,
      rows: universities,
      disabled: false,
      render: (r: Row) => r.name,
    },
    {
      n: 2,
      label: "College",
      value: collegeId,
      set: setCollegeId,
      rows: colleges,
      disabled: !uniId,
      render: (r: Row) => r.name + (r.city ? " - " + r.city : ""),
    },
    {
      n: 3,
      label: "Course and branch",
      value: branchId,
      set: setBranchId,
      rows: branches,
      disabled: !collegeId,
      render: (r: Row) => r.name,
    },
    ...(isBtech
      ? [
          {
            n: 4,
            label: "Year",
            value: yearNumber,
            set: (value: string) => {
              setYearNumber(value);
              setCommonFirstYear(false);
            },
            rows: years.map((year) => ({
              id: String(year),
              name: `${year === 1 ? "1st" : year === 2 ? "2nd" : year === 3 ? "3rd" : "4th"} Year`,
            })),
            disabled: !branchId,
            render: (r: Row) => r.name,
          },
          {
            n: 5,
            label: "Subject",
            value: subjectId,
            set: setSubjectId,
            rows: subjects,
            disabled: !yearNumber || commonFirstYear,
            render: (r: Row) =>
              r.name + (r.subject_code ? " - " + r.subject_code : ""),
          },
        ]
      : [
          {
            n: 4,
            label: "Semester",
            value: semesterId,
            set: setSemesterId,
            rows: semesters,
            disabled: !branchId,
            render: (r: Row) => r.name,
          },
          {
            n: 5,
            label: "Subject",
            value: subjectId,
            set: setSubjectId,
            rows: subjects,
            disabled: !semesterId,
            render: (r: Row) =>
              r.name + (r.subject_code ? " - " + r.subject_code : ""),
          },
        ]),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader dark />

      <main className="flex-1">
        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden bg-[#0b1020] text-white">
          <div className="grid-bg absolute inset-0" />
          <div
            className="glow"
            style={{
              width: 520,
              height: 520,
              background: "#4f46e5",
              top: -180,
              left: -80,
            }}
          />
          <div
            className="glow"
            style={{
              width: 420,
              height: 420,
              background: "#7c3aed",
              bottom: -200,
              right: -60,
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
            <div className="rise rise-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Built for college students
            </div>

            <h1 className="rise rise-2 mt-7 max-w-3xl text-[2.6rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Every paper, answer and
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
                {" "}
                important question
              </span>
              , in one place.
            </h1>

            <p className="rise rise-3 mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400">
              Search naturally by paper code or subject, or browse from your
              university to the exact course, year and branch. No dead ends, no clutter.
            </p>

            <form
              onSubmit={runSearch}
              className="rise rise-4 mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try BCS402, Engineering Mathematics, or CAE 1"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/60 focus:bg-white/10"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#0b1020] transition hover:bg-slate-200"
              >
                Search
              </button>
            </form>

            <div className="rise rise-4 mt-4 flex flex-wrap gap-2">
              {["CAE 1", "CAE 2", "Engineering Mathematics", "Physics"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() =>
                      router.push("/search?q=" + encodeURIComponent(t))
                    }
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/25 hover:text-white"
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="relative h-16 bg-gradient-to-b from-transparent to-white" />
        </section>

        {/* ---------------- STEP BROWSER ---------------- */}
        <section className="mx-auto -mt-10 max-w-6xl px-5">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_30px_70px_-40px_rgba(11,16,32,0.4)] sm:p-9">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Find it step by step
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Each dropdown only shows what actually exists.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                {universities.length} universities
              </span>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((s) => (
                <label key={s.n} className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span
                      className={
                        "flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-semibold " +
                        (s.value
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-600")
                      }
                      style={{ height: 18, width: 18 }}
                    >
                      {s.n}
                    </span>
                    {s.label}
                  </span>
                  <select
                    value={s.value}
                    onChange={(e) => s.set(e.target.value)}
                    disabled={s.disabled}
                    className="field"
                  >
                    <option value="">
                      {s.disabled ? "Choose the step above" : "Select " + s.label.toLowerCase()}
                    </option>
                    {s.rows.map((r) => (
                      <option key={r.id} value={r.id}>
                        {s.render(r)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              {isBtech && yearNumber === "1" && (
                <label className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:col-span-2 lg:col-span-3">
                  <input
                    type="checkbox"
                    checked={commonFirstYear}
                    onChange={(e) => {
                      setCommonFirstYear(e.target.checked);
                      if (e.target.checked) setSubjectId("");
                    }}
                    className="h-4 w-4"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Common to all B.Tech branches
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Show approved first-year papers marked as common.
                    </span>
                  </span>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span
                    className="flex items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600"
                    style={{ height: 18, width: 18 }}
                  >
                    6
                  </span>
                  Exam (optional)
                </span>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="field"
                >
                  <option value="">Any exam</option>
                  {EXAM_TYPES.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                onClick={runFilters}
                disabled={!uniId || (isBtech && (!branchId || !yearNumber))}
                className="btn-primary"
              >
                Show materials
              </button>
              <span className="text-xs text-slate-500">
                You can stop at any level and still see everything inside it.
              </span>
            </div>
          </div>
        </section>

        {/* ---------------- CATEGORY CARDS ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            What you will find inside
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Six kinds of material, each one tagged by exam and year.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c, i) => (
              <Link
                key={c.type}
                href={"/search?type=" + c.type}
                className="lift group rounded-2xl border border-slate-200 bg-white p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-5 text-[15px] font-semibold">{c.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {c.desc}
                </p>
                <p className="mt-5 text-xs font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
                  Browse
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------- RECENT ---------------- */}
        {recent.length > 0 && (
          <section className="border-y border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-6xl px-5 py-16">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Recently added
                </h2>
                <Link
                  href="/search"
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Browse all
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {recent.map((m) => (
                  <Link
                    key={m.id}
                    href={"/view/" + m.id}
                    className="lift rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{m.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {m.subjects?.name}
                          {m.subjects?.subject_code
                            ? " - " + m.subjects.subject_code
                            : ""}
                        </p>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                        {labelOf(MATERIAL_TYPES, m.material_type)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- TRUST ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-[#0b1020] px-8 py-14 text-white sm:px-14">
            <div className="grid-bg absolute inset-0 opacity-60" />
            <div
              className="glow"
              style={{
                width: 380,
                height: 380,
                background: "#4f46e5",
                top: -140,
                right: -60,
              }}
            />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Online viewing & offline downloading
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Every PDF is securely stored. Open papers online for quick
                revision, or download available PDFs for offline preparation.
                Your study material stays organised and accessible whenever you need it.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                 ["Secure storage", "Your study material stays protected"],
                 ["Online viewing", "Read papers instantly in your browser"],
                 ["Offline downloads", "Download enabled PDFs and study anywhere"],
                 ].map(([t, d]) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
            </main>

         <div className="border-t border-slate-200 bg-white px-5 py-8 text-center">
         
         <p className="mt-1 text-xs text-slate-400">
          Built for students, by students.
         </p>
        </div>

        <SiteFooter />
        </div>
  );
}

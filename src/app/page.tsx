"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, MATERIAL_TYPES, labelOf } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Row = Record<string, any>;

const BTECH_COURSE_ID = "06b26861-845e-4c61-9a50-815947500594";

const CARDS = [
  {
    type: "paper",
    number: "01",
    title: "Question papers",
    desc: "CAE, CT, seasonal tests, end-semester and previous-year papers.",
  },
  {
    type: "answer_pdf",
    number: "02",
    title: "Answer PDFs",
    desc: "Solutions and written answers to help you check your preparation.",
  },
  {
    type: "important_questions",
    number: "03",
    title: "Important questions",
    desc: "High-value questions collected for focused exam preparation.",
  },
  {
    type: "notes",
    number: "04",
    title: "Notes",
    desc: "Subject notes and revision material organised by your course.",
  },
  {
    type: "syllabus",
    number: "05",
    title: "Syllabus",
    desc: "Know what is included before you start preparing.",
  },
  {
    type: "practical",
    number: "06",
    title: "Practical files",
    desc: "Lab records and practical material for your subjects.",
  },
];

const SEARCH_CHIPS = [
  "CAE 1",
  "Physics",
  "Engineering Mathematics",
  "CSE PYQ",
];

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg {...common}>
        <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" />
        <path d="M14 3.5V8h4" />
        <path d="M9 12h6M9 15.5h4" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12.5 4 4L19 7" />
      </svg>
    );
  }

  if (name === "spark") {
    return (
      <svg {...common}>
        <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" />
        <path d="m19 16 .5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5z" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg {...common}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16" />
        <path d="M8 7h8M8 10.5h7" />
      </svg>
    );
  }

  if (name === "clipboard") {
    return (
      <svg {...common}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5" />
        <path d="M8.5 10h7M8.5 14h5M8.5 18h4" />
      </svg>
    );
  }

  if (name === "flask") {
    return (
      <svg {...common}>
        <path d="M9 3h6" />
        <path d="M10 3v6l-5.5 9.2A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.8L14 9V3" />
        <path d="M8 14h8" />
      </svg>
    );
  }

  if (name === "bookmark") {
    return (
      <svg {...common}>
        <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H18v19l-6-3.5L6 21z" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  return null;
}

function CardIcon({ type }: { type: string }) {
  if (type === "paper") return <Icon name="file" size={21} />;
  if (type === "answer_pdf") return <Icon name="check" size={21} />;
  if (type === "important_questions") return <Icon name="spark" size={21} />;
  if (type === "notes") return <Icon name="book" size={21} />;
  if (type === "syllabus") return <Icon name="clipboard" size={21} />;
  if (type === "practical") return <Icon name="flask" size={21} />;
  return <Icon name="file" size={21} />;
}

function cardAccent(type: string) {
  switch (type) {
    case "paper":
      return "bg-indigo-600";
    case "answer_pdf":
      return "bg-emerald-500";
    case "important_questions":
      return "bg-amber-500";
    case "notes":
      return "bg-blue-500";
    case "syllabus":
      return "bg-violet-500";
    case "practical":
      return "bg-cyan-500";
    default:
      return "bg-indigo-600";
  }
}

function materialTypeLabel(value: string | null | undefined) {
  return labelOf(MATERIAL_TYPES, value);
}

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
  const [assessmentTypes, setAssessmentTypes] = useState<Row[]>([]);

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
    setExamType("");

    setBranches([]);
    setSemesters([]);
    setSubjects([]);
    setAssessmentTypes([]);

    if (!uniId) {
      setColleges([]);
      return;
    }

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
    setExamType("");

    setSemesters([]);
    setSubjects([]);
    setAssessmentTypes([]);

    if (!collegeId) {
      setBranches([]);
      return;
    }

    supabase
      .from("college_assessment_types")
      .select("id, name, slug, aliases")
      .eq("college_id", collegeId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setAssessmentTypes(data ?? []);
      });

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
      selectedBranch?.course_id === BTECH_COURSE_ID;

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

          const uniqueYears: number[] = Array.from(
            new Set<number>(yearValues)
          ).sort((a, b) => a - b);

          setYears(uniqueYears);
        }
      });
  }, [branchId, branches]);

  useEffect(() => {
    setSubjectId("");

    if (!isBtech) {
      if (!semesterId) {
        setSubjects([]);
        return;
      }

      supabase
        .from("subjects")
        .select("id, name, subject_code")
        .eq("semester_id", semesterId)
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => setSubjects(data ?? []));

      return;
    }

    if (!yearNumber || !branchId) {
      setSubjects([]);
      return;
    }

    const year = Number(yearNumber);

    const yearSemesters = semesters.filter(
      (r: Row) => Number(r.year_number) === year
    );

    const semIds = yearSemesters.map((r: Row) => r.id);

    if (semIds.length === 0) {
      setSubjects([]);
      return;
    }

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

    if (uniId) {
      params.set("university", uniId);
    }

    if (collegeId) {
      params.set("college", collegeId);
    }

    if (branchId) {
      params.set("branch", branchId);
    }

    if (isBtech && yearNumber) {
      params.set("year", yearNumber);
    }

    if (!isBtech && semesterId) {
      params.set("semester", semesterId);
    }

    if (commonFirstYear && yearNumber === "1") {
      params.set("common_first_year", "1");
    } else if (subjectId) {
      params.set("subject", subjectId);
    }

    if (examType) {
      params.set("exam", examType);
    }

    const query = params.toString();

    router.push(query ? `/search?${query}` : "/search");
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
      render: (r: Row) => r.name + (r.city ? " · " + r.city : ""),
    },
    {
      n: 3,
      label: "Course & branch",
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
              name: `${
                year === 1
                  ? "1st"
                  : year === 2
                    ? "2nd"
                    : year === 3
                      ? "3rd"
                      : "4th"
              } Year`,
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
              r.name +
              (r.subject_code ? " · " + r.subject_code : ""),
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
              r.name +
              (r.subject_code ? " · " + r.subject_code : ""),
          },
        ]),
  ];

  const selectedUniversity = universities.find((u) => u.id === uniId);
  const selectedCollege = colleges.find((c) => c.id === collegeId);
  const selectedBranch = branches.find((b) => b.id === branchId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#0f172a]">
      <SiteHeader dark />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softPulse {
          0%, 100% {
            opacity: .32;
            transform: scale(1);
          }
          50% {
            opacity: .5;
            transform: scale(1.05);
          }
        }

        @keyframes floatPreview {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .search-shell:focus-within {
          border-color: rgba(129, 140, 248, .55);
          box-shadow:
            0 0 0 4px rgba(99, 102, 241, .10),
            0 25px 70px -30px rgba(0, 0, 0, .75);
        }

        .premium-card {
          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease;
        }

        .premium-card:hover {
          transform: translateY(-4px);
        }

        .select-active {
          border-color: rgba(99, 102, 241, .4) !important;
          background: rgba(238, 242, 255, .45) !important;
        }
      `}</style>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#080d19] text-white">
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="absolute -left-40 top-20 h-[420px] w-[420px] animate-[softPulse_7s_ease-in-out_infinite] rounded-full bg-indigo-600/20 blur-[110px]" />

          <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] animate-[softPulse_8s_1s_ease-in-out_infinite] rounded-full bg-blue-500/10 blur-[110px]" />

          <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
              <div className="animate-[fadeIn_.7s_ease-out_both]">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  STUDY MATERIAL, WITHOUT THE HUNT
                </div>

                <h1 className="mt-7 max-w-3xl text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.4rem]">
                  Every paper, answer and important question,
                  <span className="block text-indigo-400">
                     in one place.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-300">
                  Find question papers, notes, answers and important questions
                  by subject, college, branch, year or exam.
                </p>

                <form onSubmit={runSearch} className="mt-9 max-w-2xl">
                  <div className="search-shell flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.07] p-2 shadow-[0_25px_70px_-30px_rgba(0,0,0,.7)] backdrop-blur-sm transition-all duration-300 sm:flex-row">
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                      <span className="shrink-0 text-indigo-300">
                        <Icon name="search" size={20} />
                      </span>

                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search Physics, BCS402, CAE 1..."
                        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-[#0b1020] shadow-[0_8px_25px_-12px_rgba(255,255,255,.8)] transition hover:bg-indigo-50 active:scale-[.98]"
                    >
                      Search
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs text-slate-500">
                    Try
                  </span>

                  {SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        router.push(
                          "/search?q=" + encodeURIComponent(chip)
                        )
                      }
                      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-400 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* PREMIUM HERO PREVIEW */}
              <div className="relative hidden animate-[fadeIn_.9s_.15s_ease-out_both] lg:block">
                <div className="absolute -inset-8 rounded-[40px] bg-indigo-500/5 blur-3xl" />

                <div
                  className="relative ml-auto max-w-md animate-[floatPreview_6s_ease-in-out_infinite]"
                >
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-black/30 backdrop-blur-sm">
                    <div className="overflow-hidden rounded-[21px] border border-white/10 bg-[#101625]">
                      <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />

                        <span className="ml-auto text-[9px] uppercase tracking-[.18em] text-slate-600">
                          OURPREP
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-white text-red-500 shadow-lg">
                              <Icon name="file" size={20} />
                              <span className="absolute bottom-1 text-[6px] font-bold tracking-wider">
                                PDF
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] font-medium uppercase tracking-[.18em] text-slate-500">
                                Question paper
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-white">
                                Computer Organization &
                                Architecture
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-lg bg-emerald-400/10 px-2.5 py-1.5 text-[9px] font-semibold text-emerald-300">
                            CAE 1
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                          {[
                            ["College", "G.L. Bajaj"],
                            ["Branch", "CSE & Allied"],
                            ["Year", "2nd Year"],
                            ["Session", "2025–26"],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
                            >
                              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                                {label}
                              </p>
                              <p className="mt-1 truncate text-[11px] font-medium text-slate-200">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                              <Icon name="file" size={15} />
                            </div>

                            <div>
                              <p className="text-[11px] font-medium text-slate-200">
                                Digital paper
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Ready to open
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold text-slate-300">
                            Open paper
                            <Icon name="arrow" size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-5 -left-8 rounded-2xl border border-white/10 bg-[#151c2c] px-4 py-3 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                        <Icon name="check" size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-medium text-white">
                          Exact match
                        </p>
                        <p className="text-[10px] text-slate-500">
                          No clutter. Just your material.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-16 bg-gradient-to-b from-transparent to-[#f6f8fc]" />
        </section>

        {/* BROWSER */}
        <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 sm:px-8">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_-48px_rgba(15,23,42,.5)]">
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b1020] text-white">
                      <Icon name="spark" size={15} />
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500">
                      Browse
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[#0f172a]">
                    Find it step by step
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm text-slate-600">
                    Narrow your search from university all the way down to the
                    exact subject and exam.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {universities.length} universities available
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="relative">
                <div className="absolute left-[11px] top-8 hidden h-[calc(100%-55px)] w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent lg:block" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {steps.map((s) => (
                    <label key={s.n} className="group relative block">
                      <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                        <span
                          className={
                            "relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition " +
                            (s.value
                              ? "bg-[#0b1020] text-white shadow-sm"
                              : "bg-slate-100 text-slate-500")
                          }
                        >
                          {s.value ? (
                            <Icon name="check" size={12} />
                          ) : (
                            s.n
                          )}
                        </span>

                        {s.label}
                      </span>

                      <div className="relative">
                        <select
                          value={s.value}
                          onChange={(e) => s.set(e.target.value)}
                          disabled={s.disabled}
                          className={
                            "w-full appearance-none rounded-xl border px-4 py-3.5 pr-10 text-sm text-slate-800 outline-none transition hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 " +
                            (s.value
                              ? "select-active border-indigo-200"
                              : "border-slate-200 bg-white")
                          }
                        >
                          <option value="">
                            {s.disabled
                              ? "Choose the step above"
                              : "Select " + s.label.toLowerCase()}
                          </option>

                          {s.rows.map((r) => (
                            <option key={r.id} value={r.id}>
                              {s.render(r)}
                            </option>
                          ))}
                        </select>

                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          ↓
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {isBtech && yearNumber === "1" && (
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 transition hover:bg-indigo-50">
                  <input
                    type="checkbox"
                    checked={commonFirstYear}
                    onChange={(e) => {
                      setCommonFirstYear(e.target.checked);

                      if (e.target.checked) {
                        setSubjectId("");
                      }
                    }}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Common to all B.Tech branches
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      Show approved first-year material marked as common.
                    </span>
                  </span>
                </label>
              )}

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      6
                    </span>

                    Exam / assessment

                    <span className="font-normal text-slate-500">
                      Optional
                    </span>
                  </span>

                  <div className="relative">
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      disabled={!collegeId}
                      className={
                        "w-full appearance-none rounded-xl border px-4 py-3.5 pr-10 text-sm text-slate-800 outline-none transition hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 " +
                        (examType
                          ? "select-active border-indigo-200"
                          : "border-slate-200 bg-white")
                      }
                    >
                      <option value="">
                        {!collegeId ? "Select a college first" : "Any exam"}
                      </option>

                      {assessmentTypes.map((assessment) => (
                        <option
                          key={assessment.id}
                          value={assessment.slug}
                        >
                          {assessment.name}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ↓
                    </span>
                  </div>
                </label>

                <button
                  onClick={runFilters}
                  disabled={!uniId || (isBtech && (!branchId || !yearNumber))}
                  className="group flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(15,23,42,.6)] transition hover:bg-indigo-700 active:scale-[.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Show materials

                  <span className="transition-transform group-hover:translate-x-1">
                    <Icon name="arrow" size={16} />
                  </span>
                </button>
              </div>

              {(selectedUniversity ||
                selectedCollege ||
                selectedBranch ||
                selectedSubject) && (
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                  <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Current selection
                  </span>

                  {[
                    selectedUniversity?.short_name ||
                      selectedUniversity?.name,
                    selectedCollege?.name,
                    selectedBranch?.name,
                    yearNumber
                      ? `${
                          yearNumber === "1"
                            ? "1st"
                            : yearNumber === "2"
                              ? "2nd"
                              : yearNumber === "3"
                                ? "3rd"
                                : "4th"
                        } Year`
                      : null,
                    selectedSubject?.name,
                  ]
                    .filter(Boolean)
                    .map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-800 ring-1 ring-inset ring-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MATERIAL TYPES */}
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-indigo-600">
                Everything in one place
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] text-[#0f172a]">
                Study material, sorted.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Pick what you need and go straight to the material.
              </p>
            </div>

            <Link
              href="/search"
              className="hidden text-sm font-medium text-slate-900 transition hover:text-indigo-600 sm:flex sm:items-center sm:gap-2"
            >
              Browse everything
              <Icon name="arrow" size={15} />
            </Link>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((card) => (
              <Link
                key={card.type}
                href={"/search?type=" + card.type}
                className="premium-card group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 hover:border-indigo-200 hover:shadow-[0_22px_50px_-30px_rgba(79,70,229,.32)]"
              >
                <div
                  className={`absolute left-0 top-0 h-1 w-0 ${cardAccent(
                    card.type
                  )} transition-all duration-300 group-hover:w-full`}
                />

                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:text-indigo-600`}
                  >
                    <CardIcon type={card.type} />
                  </div>

                  <span className="text-[11px] font-semibold tracking-[.15em] text-slate-300">
                    {card.number}
                  </span>
                </div>

                <h3 className="mt-8 text-[16px] font-bold tracking-[-.02em] text-[#0f172a]">
                  {card.title}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  {card.desc}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="h-px w-8 bg-slate-200 transition-all duration-300 group-hover:w-14 group-hover:bg-indigo-500" />

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <Icon name="arrow" size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/search"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-900 sm:hidden"
          >
            Browse everything
            <Icon name="arrow" size={15} />
          </Link>
        </section>

        {/* RECENT MATERIALS */}
        {recent.length > 0 && (
          <section className="border-y border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-500">
                    Freshly uploaded
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] text-[#0f172a]">
                    Recently added
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    New material that has recently landed on OurPrep.
                  </p>
                </div>

                <Link
                  href="/search"
                  className="hidden items-center gap-2 text-sm font-medium text-slate-900 transition hover:text-indigo-600 sm:flex"
                >
                  View all
                  <Icon name="arrow" size={15} />
                </Link>
              </div>

              <div className="mt-9 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {recent.map((m) => (
                  <Link
                    key={m.id}
                    href={"/view/" + m.id}
                    className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                        <Icon name="file" size={19} />
                        <span className="absolute bottom-1 text-[5px] font-bold tracking-wider text-slate-400">
                          PDF
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0f172a]">
                          {m.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-600">
                          {m.subjects?.name}
                          {m.subjects?.subject_code
                            ? " · " + m.subjects.subject_code
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 pl-16 sm:pl-0">
                      <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                        {materialTypeLabel(m.material_type)}
                      </span>

                      {m.academic_year && (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-700">
                          {m.academic_year}
                        </span>
                      )}

                      <span className="ml-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500">
                        <Icon name="arrow" size={16} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-[#080d19] px-7 py-14 text-white sm:px-12 sm:py-16">
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                <Icon name="spark" size={17} />
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
                Stop searching through
                <span className="text-indigo-400"> random groups.</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Find the paper you need, open it online, and get back to
                preparing.
              </p>

              <button
                onClick={() =>
                  document
                    .querySelector("input")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                }
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0b1020] transition hover:bg-indigo-50"
              >
                Start searching
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="border-t border-slate-200 bg-white px-5 py-8 text-center">
        <p className="text-xs text-slate-500">
          Built for students, by students.
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
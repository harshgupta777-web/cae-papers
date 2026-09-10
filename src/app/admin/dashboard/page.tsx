"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Counts = Record<string, number | null>;

const SECTIONS = [
  {
    title: "Universities",
    desc: "Add, rename, hide or delete universities",
    href: "/admin/universities",
  },
  {
    title: "Structure",
    desc: "Courses, colleges, branches, semesters and subjects",
    href: "/admin/structure",
  },
  {
    title: "Materials",
    desc: "Upload PDFs, edit details, publish or unpublish",
    href: "/admin/materials",
  },
];

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState("");
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        window.location.href = "/admin";
        return;
      }

      const { data: adminRows, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id);

      if (error) {
        setDenied("Database error: " + error.message);
        return;
      }
      if (!adminRows || adminRows.length === 0) {
        setDenied("This account is not an admin.");
        return;
      }

      setEmail(user.email ?? "");

      const tables = [
        "universities",
        "colleges",
        "branches",
        "semesters",
        "subjects",
        "materials",
      ];
      const next: Counts = {};
      for (const t of tables) {
        const { count } = await supabase
          .from(t)
          .select("id", { count: "exact", head: true });
        next[t] = count ?? 0;
      }
      const { count: live } = await supabase
        .from("materials")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true);
      next.published = live ?? 0;

      setCounts(next);
      setReady(true);
    }
    init();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="mt-3 text-sm text-slate-600">{denied}</p>
          <a href="/admin" className="mt-6 inline-block text-sm text-indigo-600">
            Back to login
          </a>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading dashboard...
      </main>
    );
  }

  const stats = [
    { label: "Universities", value: counts.universities },
    { label: "Colleges", value: counts.colleges },
    { label: "Branches", value: counts.branches },
    { label: "Subjects", value: counts.subjects },
    { label: "Materials", value: counts.materials },
    { label: "Published", value: counts.published },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#0b1020] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold">
              CP
            </span>
            <div>
              <p className="text-sm font-semibold">Control panel</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              View site
            </a>
            <button
              onClick={logout}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-2xl font-semibold tracking-tight">
                {s.value ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold">Manage content</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SECTIONS.map((s) => (
            <a
              key={s.title}
              href={s.href}
              className="lift rounded-2xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {s.desc}
              </p>
              <p className="mt-5 text-xs font-medium text-indigo-600">Open</p>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold">You are in full control</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Nothing reaches students until you publish it. Edit renames anything
            instantly, Hide removes it from student browsing, and Delete removes
            it along with everything inside.
          </p>
        </div>
      </div>
    </main>
  );
}

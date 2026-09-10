"use client";

import { useEffect, useState } from "react";
import { supabase, makeSlug } from "@/lib/supabase";

type Row = Record<string, any>;

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StructurePage() {
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState("");
  const [msg, setMsg] = useState("");

  const [universities, setUniversities] = useState<Row[]>([]);
  const [courses, setCourses] = useState<Row[]>([]);
  const [colleges, setColleges] = useState<Row[]>([]);
  const [branches, setBranches] = useState<Row[]>([]);
  const [semesters, setSemesters] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<Row[]>([]);

  const [uniId, setUniId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const [courseName, setCourseName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeCity, setCollegeCity] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCourse, setBranchCourse] = useState("");
  const [semName, setSemName] = useState("");
  const [semNumber, setSemNumber] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const [editKey, setEditKey] = useState("");
  const [editA, setEditA] = useState("");
  const [editB, setEditB] = useState("");

  async function loadUniversities() {
    const { data } = await supabase
      .from("universities")
      .select("id, name")
      .order("name");
    setUniversities(data ?? []);
  }
  async function loadCourses() {
    const { data } = await supabase
      .from("courses")
      .select("id, name, short_name, is_active")
      .order("name");
    setCourses(data ?? []);
  }
  async function loadColleges(id = uniId) {
    if (!id) return setColleges([]);
    const { data } = await supabase
      .from("colleges")
      .select("id, name, city, is_active")
      .eq("university_id", id)
      .order("name");
    setColleges(data ?? []);
  }
  async function loadBranches(id = collegeId) {
    if (!id) return setBranches([]);
    const { data } = await supabase
      .from("branches")
      .select("id, name, short_name, is_active")
      .eq("college_id", id)
      .order("name");
    setBranches(data ?? []);
  }
  async function loadSemesters(id = branchId) {
    if (!id) return setSemesters([]);
    const { data } = await supabase
      .from("semesters")
      .select("id, name, semester_number, is_active")
      .eq("branch_id", id)
      .order("semester_number");
    setSemesters(data ?? []);
  }
  async function loadSubjects(id = semesterId) {
    if (!id) return setSubjects([]);
    const { data } = await supabase
      .from("subjects")
      .select("id, name, subject_code, is_active")
      .eq("semester_id", id)
      .order("name");
    setSubjects(data ?? []);
  }

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
      if (error) return setDenied("Database error: " + error.message);
      if (!adminRows || adminRows.length === 0)
        return setDenied("This account is not an admin.");
      await loadUniversities();
      await loadCourses();
      setReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    setCollegeId("");
    setBranchId("");
    setSemesterId("");
    setBranches([]);
    setSemesters([]);
    setSubjects([]);
    loadColleges(uniId);
  }, [uniId]);

  useEffect(() => {
    setBranchId("");
    setSemesterId("");
    setSemesters([]);
    setSubjects([]);
    loadBranches(collegeId);
  }, [collegeId]);

  useEffect(() => {
    setSemesterId("");
    setSubjects([]);
    loadSemesters(branchId);
  }, [branchId]);

  useEffect(() => {
    loadSubjects(semesterId);
  }, [semesterId]);

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseName.trim()) return;
    const { error } = await supabase.from("courses").insert({
      name: courseName.trim(),
      slug: makeSlug(courseName),
      is_active: true,
    });
    if (error) return setMsg("Course: " + error.message);
    setCourseName("");
    setMsg("Course added.");
    loadCourses();
  }

  async function addCollege(e: React.FormEvent) {
    e.preventDefault();
    if (!uniId || !collegeName.trim()) return setMsg("Pick a university first.");
    const { error } = await supabase.from("colleges").insert({
      university_id: uniId,
      name: collegeName.trim(),
      slug: makeSlug(collegeName),
      city: collegeCity.trim() || null,
      is_active: true,
    });
    if (error) return setMsg("College: " + error.message);
    setCollegeName("");
    setCollegeCity("");
    setMsg("College added.");
    loadColleges();
  }

  async function addBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!collegeId || !branchName.trim()) return setMsg("Pick a college first.");
    const payload: Row = {
      college_id: collegeId,
      name: branchName.trim(),
      slug: makeSlug(branchName),
      is_active: true,
    };
    if (branchCourse) payload.course_id = branchCourse;
    const { error } = await supabase.from("branches").insert(payload);
    if (error) return setMsg("Branch: " + error.message);
    setBranchName("");
    setMsg("Branch added.");
    loadBranches();
  }

  async function addSemester(e: React.FormEvent) {
    e.preventDefault();
    if (!branchId || !semNumber) return setMsg("Pick a branch and a number.");
    const { error } = await supabase.from("semesters").insert({
      branch_id: branchId,
      semester_number: Number(semNumber),
      name: semName.trim() || "Semester " + semNumber,
      is_active: true,
    });
    if (error) return setMsg("Semester: " + error.message);
    setSemName("");
    setSemNumber("");
    setMsg("Semester added.");
    loadSemesters();
  }

  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!semesterId || !subjectName.trim())
      return setMsg("Pick a semester first.");
    const { error } = await supabase.from("subjects").insert({
      semester_id: semesterId,
      name: subjectName.trim(),
      slug: makeSlug(subjectName),
      subject_code: subjectCode.trim() || null,
      is_active: true,
    });
    if (error) return setMsg("Subject: " + error.message);
    setSubjectName("");
    setSubjectCode("");
    setMsg("Subject added.");
    loadSubjects();
  }

  async function toggle(table: string, r: Row, reload: () => void) {
    const { error } = await supabase
      .from(table)
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    if (error) return setMsg(error.message);
    reload();
  }

  async function remove(table: string, r: Row, reload: () => void) {
    if (!confirm("Delete " + (r.name ?? "this") + "? Everything inside goes too."))
      return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) return setMsg(error.message);
    reload();
  }

  async function saveEdit(table: string, r: Row, reload: () => void) {
    if (!editA.trim()) return setMsg("Name cannot be empty.");
    const payload: Row = { name: editA.trim() };
    if (table !== "semesters") payload.slug = makeSlug(editA);
    if (table === "colleges") payload.city = editB.trim() || null;
    if (table === "subjects") payload.subject_code = editB.trim() || null;
    if (table === "branches" || table === "courses")
      payload.short_name = editB.trim() || null;
    if (table === "semesters" && editB) payload.semester_number = Number(editB);

    const { error } = await supabase.from(table).update(payload).eq("id", r.id);
    if (error) return setMsg(error.message);
    setEditKey("");
    setMsg("Updated.");
    reload();
  }

  function List({
    table,
    rows,
    reload,
    secondField,
    secondPlaceholder,
  }: {
    table: string;
    rows: Row[];
    reload: () => void;
    secondField?: (r: Row) => string;
    secondPlaceholder?: string;
  }) {
    if (rows.length === 0)
      return <p className="text-xs text-slate-500">Nothing here yet.</p>;

    return (
      <ul className="thin-scroll max-h-80 divide-y divide-slate-100 overflow-auto rounded-xl border border-slate-100">
        {rows.map((r) => {
          const key = table + ":" + r.id;
          const editing = editKey === key;
          return (
            <li key={r.id} className="px-4 py-3">
              {editing ? (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={editA}
                      onChange={(e) => setEditA(e.target.value)}
                      className="field"
                    />
                    <input
                      value={editB}
                      onChange={(e) => setEditB(e.target.value)}
                      placeholder={secondPlaceholder ?? "Optional"}
                      className="field"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => saveEdit(table, r, reload)}
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditKey("")}
                      className="text-xs font-medium text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">
                      {r.name}
                      {r.is_active === false && (
                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                          hidden
                        </span>
                      )}
                    </p>
                    {secondField && secondField(r) && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {secondField(r)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setEditKey(key);
                        setEditA(r.name ?? "");
                        setEditB(
                          table === "colleges"
                            ? r.city ?? ""
                            : table === "subjects"
                            ? r.subject_code ?? ""
                            : table === "semesters"
                            ? String(r.semester_number ?? "")
                            : r.short_name ?? ""
                        );
                      }}
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggle(table, r, reload)}
                      className="text-xs font-medium text-slate-600 hover:underline"
                    >
                      {r.is_active === false ? "Show" : "Hide"}
                    </button>
                    <button
                      onClick={() => remove(table, r, reload)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (denied)
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

  if (!ready)
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading...
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#0b1020] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold">Structure</p>
          <a
            href="/admin/dashboard"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
          >
            Back to dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-5 px-5 py-10">
        {msg && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
            {msg}
          </p>
        )}

        <Panel title="Courses" subtitle="BTech, BCA, MBA and so on">
          <form onSubmit={addCourse} className="flex flex-wrap gap-3">
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course name"
              className="field max-w-xs"
            />
            <button type="submit" className="btn-primary">
              Add
            </button>
          </form>
          <div className="mt-4">
            <List
              table="courses"
              rows={courses}
              reload={loadCourses}
              secondField={(r) => r.short_name ?? ""}
              secondPlaceholder="Short name"
            />
          </div>
        </Panel>

        <Panel title="Colleges" subtitle="Pick a university, then add its colleges">
          <select
            value={uniId}
            onChange={(e) => setUniId(e.target.value)}
            className="field max-w-md"
          >
            <option value="">Select university</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {uniId && (
            <>
              <form onSubmit={addCollege} className="mt-4 flex flex-wrap gap-3">
                <input
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="College name"
                  className="field max-w-xs"
                />
                <input
                  value={collegeCity}
                  onChange={(e) => setCollegeCity(e.target.value)}
                  placeholder="City"
                  className="field max-w-[160px]"
                />
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </form>
              <div className="mt-4">
                <List
                  table="colleges"
                  rows={colleges}
                  reload={loadColleges}
                  secondField={(r) => r.city ?? ""}
                  secondPlaceholder="City"
                />
              </div>
            </>
          )}
        </Panel>

        <Panel title="Branches" subtitle="Pick a college, then add its branches">
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            disabled={!uniId}
            className="field max-w-md"
          >
            <option value="">Select college</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {collegeId && (
            <>
              <form onSubmit={addBranch} className="mt-4 flex flex-wrap gap-3">
                <input
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Branch name"
                  className="field max-w-xs"
                />
                <select
                  value={branchCourse}
                  onChange={(e) => setBranchCourse(e.target.value)}
                  className="field max-w-[200px]"
                >
                  <option value="">Course (optional)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </form>
              <div className="mt-4">
                <List
                  table="branches"
                  rows={branches}
                  reload={loadBranches}
                  secondField={(r) => r.short_name ?? ""}
                  secondPlaceholder="Short name"
                />
              </div>
            </>
          )}
        </Panel>

        <Panel title="Semesters" subtitle="Pick a branch, then add its semesters">
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            disabled={!collegeId}
            className="field max-w-md"
          >
            <option value="">Select branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {branchId && (
            <>
              <form onSubmit={addSemester} className="mt-4 flex flex-wrap gap-3">
                <input
                  value={semNumber}
                  onChange={(e) => setSemNumber(e.target.value)}
                  placeholder="Number"
                  type="number"
                  min={1}
                  max={12}
                  className="field max-w-[110px]"
                />
                <input
                  value={semName}
                  onChange={(e) => setSemName(e.target.value)}
                  placeholder="Label (optional)"
                  className="field max-w-xs"
                />
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </form>
              <div className="mt-4">
                <List
                  table="semesters"
                  rows={semesters}
                  reload={loadSemesters}
                  secondField={(r) => "Semester " + r.semester_number}
                  secondPlaceholder="Number"
                />
              </div>
            </>
          )}
        </Panel>

        <Panel title="Subjects" subtitle="Pick a semester, then add its subjects">
          <select
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            disabled={!branchId}
            className="field max-w-md"
          >
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {semesterId && (
            <>
              <form onSubmit={addSubject} className="mt-4 flex flex-wrap gap-3">
                <input
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="field max-w-xs"
                />
                <input
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="Code"
                  className="field max-w-[160px]"
                />
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </form>
              <div className="mt-4">
                <List
                  table="subjects"
                  rows={subjects}
                  reload={loadSubjects}
                  secondField={(r) => r.subject_code ?? ""}
                  secondPlaceholder="Code"
                />
              </div>
            </>
          )}
        </Panel>
      </div>
    </main>
  );
}

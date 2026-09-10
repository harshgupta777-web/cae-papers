"use client";

import { useEffect, useState } from "react";
import { supabase, MATERIAL_TYPES, EXAM_TYPES, labelOf } from "@/lib/supabase";

type Row = Record<string, any>;

export default function MaterialsPage() {
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [universities, setUniversities] = useState<Row[]>([]);
  const [colleges, setColleges] = useState<Row[]>([]);
  const [branches, setBranches] = useState<Row[]>([]);
  const [semesters, setSemesters] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<Row[]>([]);

  const [uniId, setUniId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState("paper");
  const [examType, setExamType] = useState("cae1");
  const [year, setYear] = useState("");
  const [publish, setPublish] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [rows, setRows] = useState<Row[]>([]);

  const [editId, setEditId] = useState("");
  const [eTitle, setETitle] = useState("");
  const [eType, setEType] = useState("paper");
  const [eExam, setEExam] = useState("cae1");
  const [eYear, setEYear] = useState("");

  async function loadMaterials(id = subjectId) {
    if (!id) return setRows([]);
    const { data, error } = await supabase
      .from("materials")
      .select(
        "id, title, material_type, exam_type, academic_year, is_published, file_path, view_count, created_at"
      )
      .eq("subject_id", id)
      .order("created_at", { ascending: false });
    if (error) setMsg(error.message);
    setRows(data ?? []);
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

      const { data } = await supabase
        .from("universities")
        .select("id, name")
        .order("name");
      setUniversities(data ?? []);
      setReady(true);
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
    setRows([]);
    if (!uniId) return setColleges([]);
    supabase
      .from("colleges")
      .select("id, name")
      .eq("university_id", uniId)
      .order("name")
      .then(({ data }) => setColleges(data ?? []));
  }, [uniId]);

  useEffect(() => {
    setBranchId("");
    setSemesterId("");
    setSubjectId("");
    setSemesters([]);
    setSubjects([]);
    setRows([]);
    if (!collegeId) return setBranches([]);
    supabase
      .from("branches")
      .select("id, name")
      .eq("college_id", collegeId)
      .order("name")
      .then(({ data }) => setBranches(data ?? []));
  }, [collegeId]);

  useEffect(() => {
    setSemesterId("");
    setSubjectId("");
    setSubjects([]);
    setRows([]);
    if (!branchId) return setSemesters([]);
    supabase
      .from("semesters")
      .select("id, name, semester_number")
      .eq("branch_id", branchId)
      .order("semester_number")
      .then(({ data }) => setSemesters(data ?? []));
  }, [branchId]);

  useEffect(() => {
    setSubjectId("");
    setRows([]);
    if (!semesterId) return setSubjects([]);
    supabase
      .from("subjects")
      .select("id, name, subject_code")
      .eq("semester_id", semesterId)
      .order("name")
      .then(({ data }) => setSubjects(data ?? []));
  }, [semesterId]);

  useEffect(() => {
    loadMaterials(subjectId);
  }, [subjectId]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!subjectId) return setMsg("Pick a subject first.");
    if (!title.trim()) return setMsg("Enter a title.");
    if (!file) return setMsg("Choose a PDF file.");
    if (file.type !== "application/pdf") return setMsg("Only PDF files.");

    setBusy(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = subjectId + "/" + Date.now() + "-" + safeName;

    const { error: upErr } = await supabase.storage
      .from("materials")
      .upload(path, file, { contentType: "application/pdf" });

    if (upErr) {
      setBusy(false);
      return setMsg("Upload failed: " + upErr.message);
    }

    const { error: insErr } = await supabase.from("materials").insert({
      subject_id: subjectId,
      title: title.trim(),
      material_type: materialType,
      exam_type: examType,
      academic_year: year.trim() || null,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      is_published: publish,
    });

    if (insErr) {
      await supabase.storage.from("materials").remove([path]);
      setBusy(false);
      return setMsg("Could not save: " + insErr.message);
    }

    setTitle("");
    setYear("");
    setFile(null);
    (document.getElementById("pdfInput") as HTMLInputElement | null)?.value &&
      ((document.getElementById("pdfInput") as HTMLInputElement).value = "");
    setMsg(publish ? "Uploaded and published." : "Uploaded as draft.");
    setBusy(false);
    loadMaterials();
  }

  async function togglePublish(r: Row) {
    const { error } = await supabase
      .from("materials")
      .update({ is_published: !r.is_published })
      .eq("id", r.id);
    if (error) return setMsg(error.message);
    loadMaterials();
  }

  async function saveEdit() {
    if (!eTitle.trim()) return setMsg("Title cannot be empty.");
    const { error } = await supabase
      .from("materials")
      .update({
        title: eTitle.trim(),
        material_type: eType,
        exam_type: eExam,
        academic_year: eYear.trim() || null,
      })
      .eq("id", editId);
    if (error) return setMsg(error.message);
    setEditId("");
    setMsg("Updated.");
    loadMaterials();
  }

  async function preview(r: Row) {
    if (!r.file_path) return setMsg("No file on this material.");
    const { data, error } = await supabase.storage
      .from("materials")
      .createSignedUrl(r.file_path, 120);
    if (error || !data) return setMsg("Could not open: " + (error?.message ?? ""));
    window.open(data.signedUrl, "_blank");
  }

  async function remove(r: Row) {
    if (!confirm("Delete " + r.title + "? The PDF is removed too.")) return;
    if (r.file_path)
      await supabase.storage.from("materials").remove([r.file_path]);
    const { error } = await supabase.from("materials").delete().eq("id", r.id);
    if (error) return setMsg(error.message);
    loadMaterials();
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

  const picks = [
    {
      label: "University",
      value: uniId,
      set: setUniId,
      rows: universities,
      disabled: false,
    },
    {
      label: "College",
      value: collegeId,
      set: setCollegeId,
      rows: colleges,
      disabled: !uniId,
    },
    {
      label: "Branch",
      value: branchId,
      set: setBranchId,
      rows: branches,
      disabled: !collegeId,
    },
    {
      label: "Semester",
      value: semesterId,
      set: setSemesterId,
      rows: semesters,
      disabled: !branchId,
    },
    {
      label: "Subject",
      value: subjectId,
      set: setSubjectId,
      rows: subjects,
      disabled: !semesterId,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#0b1020] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold">Materials</p>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold">Choose where it belongs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((p) => (
              <label key={p.label} className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  {p.label}
                </span>
                <select
                  value={p.value}
                  onChange={(e) => p.set(e.target.value)}
                  disabled={p.disabled}
                  className="field"
                >
                  <option value="">Select</option>
                  {p.rows.map((r: Row) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.subject_code ? " - " + r.subject_code : ""}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>

        {subjectId && (
          <form
            onSubmit={upload}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-sm font-semibold">Upload a PDF</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title, e.g. CAE 1 2024 paper"
                className="field"
              />
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Academic year, e.g. 2024-25"
                className="field"
              />
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="field"
              >
                {MATERIAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="field"
              >
                {EXAM_TYPES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              id="pdfInput"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-4 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:text-white"
            />

            <label className="mt-4 flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
              Publish immediately
            </label>

            <button type="submit" disabled={busy} className="btn-primary mt-5">
              {busy ? "Uploading..." : "Upload material"}
            </button>
          </form>
        )}

        {subjectId && (
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <p className="text-sm font-semibold">
                Materials in this subject ({rows.length})
              </p>
            </div>

            {rows.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500">Nothing yet.</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <li key={r.id} className="px-6 py-4">
                    {editId === r.id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            value={eTitle}
                            onChange={(e) => setETitle(e.target.value)}
                            className="field"
                          />
                          <input
                            value={eYear}
                            onChange={(e) => setEYear(e.target.value)}
                            placeholder="Academic year"
                            className="field"
                          />
                          <select
                            value={eType}
                            onChange={(e) => setEType(e.target.value)}
                            className="field"
                          >
                            {MATERIAL_TYPES.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={eExam}
                            onChange={(e) => setEExam(e.target.value)}
                            className="field"
                          >
                            {EXAM_TYPES.map((x) => (
                              <option key={x.value} value={x.value}>
                                {x.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={saveEdit} className="btn-primary">
                            Save changes
                          </button>
                          <button
                            onClick={() => setEditId("")}
                            className="text-xs font-medium text-slate-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {r.title}
                            <span
                              className={
                                "ml-2 rounded px-2 py-0.5 text-[11px] " +
                                (r.is_published
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500")
                              }
                            >
                              {r.is_published ? "live" : "draft"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {labelOf(MATERIAL_TYPES, r.material_type)} |{" "}
                            {labelOf(EXAM_TYPES, r.exam_type)}
                            {r.academic_year ? " | " + r.academic_year : ""} |{" "}
                            {r.view_count ?? 0} views
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => preview(r)}
                            className="text-xs font-medium text-slate-600 hover:underline"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => {
                              setEditId(r.id);
                              setETitle(r.title ?? "");
                              setEType(r.material_type ?? "paper");
                              setEExam(r.exam_type ?? "cae1");
                              setEYear(r.academic_year ?? "");
                            }}
                            className="text-xs font-medium text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => togglePublish(r)}
                            className="text-xs font-medium text-slate-600 hover:underline"
                          >
                            {r.is_published ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => remove(r)}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

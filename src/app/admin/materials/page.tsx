"use client";

import { useEffect, useState } from "react";
import { supabase, MATERIAL_TYPES, labelOf } from "@/lib/supabase";

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
  const [assessmentTypes, setAssessmentTypes] = useState<Row[]>([]);

  const [uniId, setUniId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [yearNumber, setYearNumber] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [isBtech, setIsBtech] = useState(false);
  const [isBtechYear1, setIsBtechYear1] = useState(false);
  const [isCommonFirstYear, setIsCommonFirstYear] = useState(false);

  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState("paper");
  const [examType, setExamType] = useState("");
  const [year, setYear] = useState("");
  const [publish, setPublish] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [rows, setRows] = useState<Row[]>([]);

  const [editId, setEditId] = useState("");
  const [eTitle, setETitle] = useState("");
  const [eType, setEType] = useState("paper");
  const [eExam, setEExam] = useState("");
  const [eYear, setEYear] = useState("");

  // ------------------------------------------------------------
  // LOAD MATERIALS
  // ------------------------------------------------------------

  async function loadMaterials(id = subjectId) {
    if (!id) {
      setRows([]);
      return;
    }

    const { data, error } = await supabase
      .from("materials")
      .select(
        "id, title, material_type, exam_type, academic_year, is_published, allow_download, is_common_first_year, file_path, view_count, created_at"
      )
      .eq("subject_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(error.message);
      return;
    }

    setRows(data ?? []);
  }

  // ------------------------------------------------------------
  // LOAD ASSESSMENTS FOR SELECTED COLLEGE
  // ------------------------------------------------------------

  async function loadAssessmentTypes(id = collegeId) {
    if (!id) {
      setAssessmentTypes([]);
      return;
    }

    const { data, error } = await supabase
      .from("college_assessment_types")
      .select("id, name, slug, aliases")
      .eq("college_id", id)
      .eq("is_active", true)
      .order("name");

    if (error) {
      setMsg("Assessment types: " + error.message);
      setAssessmentTypes([]);
      return;
    }

    setAssessmentTypes(data ?? []);

    // If the currently selected assessment no longer exists
    if (
      examType &&
      !(data ?? []).some((a: Row) => a.slug === examType)
    ) {
      setExamType("");
    }

    if (
      eExam &&
      !(data ?? []).some((a: Row) => a.slug === eExam)
    ) {
      setEExam("");
    }
  }

  // ------------------------------------------------------------
  // INITIAL ADMIN CHECK
  // ------------------------------------------------------------

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

      const { data } = await supabase
        .from("universities")
        .select("id, name")
        .order("name");

      setUniversities(data ?? []);
      setReady(true);
    }

    init();
  }, []);

  // ------------------------------------------------------------
  // UNIVERSITY CHANGED
  // ------------------------------------------------------------

  useEffect(() => {
    setCollegeId("");
    setBranchId("");
    setYearNumber("");
    setSemesterId("");
    setSubjectId("");

    setColleges([]);
    setBranches([]);
    setSemesters([]);
    setSubjects([]);
    setAssessmentTypes([]);
    setRows([]);

    setIsBtech(false);
    setIsBtechYear1(false);
    setIsCommonFirstYear(false);

    setExamType("");

    if (!uniId) return;

    supabase
      .from("colleges")
      .select("id, name")
      .eq("university_id", uniId)
      .order("name")
      .then(({ data }) => {
        setColleges(data ?? []);
      });
  }, [uniId]);

  // ------------------------------------------------------------
  // COLLEGE CHANGED
  // ------------------------------------------------------------

  useEffect(() => {
    setBranchId("");
    setYearNumber("");
    setSemesterId("");
    setSubjectId("");

    setBranches([]);
    setSemesters([]);
    setSubjects([]);
    setRows([]);

    setIsBtech(false);
    setIsBtechYear1(false);
    setIsCommonFirstYear(false);

    setExamType("");
    setEExam("");

    if (!collegeId) {
      setAssessmentTypes([]);
      return;
    }

    // College-wise assessments
    loadAssessmentTypes(collegeId);

    // College branches
    supabase
      .from("branches")
      .select("id, name, course_id")
      .eq("college_id", collegeId)
      .order("name")
      .then(({ data }) => {
        setBranches(data ?? []);
      });
  }, [collegeId]);

  // ------------------------------------------------------------
  // BRANCH CHANGED
  // ------------------------------------------------------------

  useEffect(() => {
    setYearNumber("");
    setSemesterId("");
    setSubjectId("");

    setSemesters([]);
    setSubjects([]);
    setRows([]);

    setIsBtech(false);
    setIsBtechYear1(false);
    setIsCommonFirstYear(false);

    if (!branchId) return;

    const selectedBranch = branches.find(
      (b) => b.id === branchId
    );

    const btech =
      selectedBranch?.course_id ===
      "06b26861-845e-4c61-9a50-815947500594";

    setIsBtech(Boolean(btech));

    supabase
      .from("semesters")
      .select("id, name, semester_number, year_number")
      .eq("branch_id", branchId)
      .order("semester_number")
      .then(({ data }) => {
        setSemesters(data ?? []);
      });
  }, [branchId, branches]);

  // ------------------------------------------------------------
  // STUDY YEAR / SEMESTER STATE
  // ------------------------------------------------------------

  useEffect(() => {
    const selectedSemester = semesters.find(
      (s) => s.id === semesterId
    );

    if (!selectedSemester) {
      setIsBtechYear1(false);
      setIsCommonFirstYear(false);
      return;
    }

    const selectedYear = Number(
      selectedSemester.year_number
    );

    const year1 = isBtech && selectedYear === 1;

    setIsBtechYear1(year1);

    if (!year1) {
      setIsCommonFirstYear(false);
    }
  }, [isBtech, semesterId, semesters]);

  // ------------------------------------------------------------
  // SEMESTER CHANGED
  // ------------------------------------------------------------

  useEffect(() => {
    setSubjectId("");
    setRows([]);

    if (!semesterId) {
      setSubjects([]);
      return;
    }

    supabase
      .from("subjects")
      .select("id, name, subject_code")
      .eq("semester_id", semesterId)
      .order("name")
      .then(({ data }) => {
        setSubjects(data ?? []);
      });
  }, [semesterId]);

  // ------------------------------------------------------------
  // SUBJECT CHANGED
  // ------------------------------------------------------------

  useEffect(() => {
    if (!subjectId) {
      setRows([]);
      return;
    }

    loadMaterials(subjectId);
  }, [subjectId]);

  // ------------------------------------------------------------
  // UPLOAD
  // ------------------------------------------------------------

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!uniId) {
      return setMsg("Select a university first.");
    }

    if (!collegeId) {
      return setMsg("Select a college first.");
    }

    if (!branchId) {
      return setMsg("Select a branch first.");
    }

    if (!semesterId) {
      return setMsg("Select a semester first.");
    }

    if (!subjectId) {
      return setMsg("Pick a subject first.");
    }

    if (!examType) {
      return setMsg("Select an assessment/exam type.");
    }

    if (!year.trim()) {
      return setMsg("Enter the academic year, e.g. 2024-25.");
    }

    if (!title.trim()) {
      return setMsg("Enter a title.");
    }

    if (isCommonFirstYear && !isBtechYear1) {
      setIsCommonFirstYear(false);
      return setMsg(
        "Common first year is only available for B.Tech Year 1."
      );
    }

    if (!file) {
      return setMsg("Choose a PDF file.");
    }

    if (file.type !== "application/pdf") {
      return setMsg("Only PDF files are allowed.");
    }

    setBusy(true);

    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const path =
      subjectId +
      "/" +
      Date.now() +
      "-" +
      safeName;

    const { error: upErr } = await supabase.storage
      .from("materials")
      .upload(path, file, {
        contentType: "application/pdf",
      });

    if (upErr) {
      setBusy(false);
      return setMsg(
        "Upload failed: " + upErr.message
      );
    }

    const { error: insErr } = await supabase
      .from("materials")
      .insert({
        subject_id: subjectId,
        title: title.trim(),
        material_type: materialType,

        // College-specific assessment slug
        exam_type: examType,

        // Academic/session year
        academic_year: year.trim(),

        file_path: path,
        file_name: file.name,
        file_size: file.size,
        is_published: publish,
        is_common_first_year: isCommonFirstYear,
      });

    if (insErr) {
      await supabase.storage
        .from("materials")
        .remove([path]);

      setBusy(false);

      return setMsg(
        "Could not save: " + insErr.message
      );
    }

    setTitle("");
    setYear("");
    setIsCommonFirstYear(false);
    setFile(null);

    const input = document.getElementById(
      "pdfInput"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }

    setMsg(
      publish
        ? "Uploaded and published."
        : "Uploaded as draft."
    );

    setBusy(false);

    loadMaterials();
  }

  // ------------------------------------------------------------
  // PUBLISH
  // ------------------------------------------------------------

  async function togglePublish(r: Row) {
    const { error } = await supabase
      .from("materials")
      .update({
        is_published: !r.is_published,
      })
      .eq("id", r.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(
      r.is_published
        ? "Unpublished."
        : "Published."
    );

    loadMaterials();
  }

  // ------------------------------------------------------------
  // DOWNLOAD
  // ------------------------------------------------------------

  async function toggleDownload(r: Row) {
    const { error } = await supabase
      .from("materials")
      .update({
        allow_download: !r.allow_download,
      })
      .eq("id", r.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(
      r.allow_download
        ? "Download disabled."
        : "Download enabled."
    );

    loadMaterials();
  }

  // ------------------------------------------------------------
  // EDIT
  // ------------------------------------------------------------

  async function saveEdit() {
    if (!eTitle.trim()) {
      return setMsg("Title cannot be empty.");
    }

    if (!eExam) {
      return setMsg("Select an assessment/exam type.");
    }

    if (!eYear.trim()) {
      return setMsg(
        "Enter the academic year."
      );
    }

    const { error } = await supabase
      .from("materials")
      .update({
        title: eTitle.trim(),
        material_type: eType,
        exam_type: eExam,
        academic_year: eYear.trim(),
      })
      .eq("id", editId);

    if (error) {
      setMsg(error.message);
      return;
    }

    setEditId("");
    setMsg("Updated.");

    loadMaterials();
  }

  // ------------------------------------------------------------
  // PREVIEW
  // ------------------------------------------------------------

  async function preview(r: Row) {
    if (!r.file_path) {
      return setMsg(
        "No file on this material."
      );
    }

    const { data, error } =
      await supabase.storage
        .from("materials")
        .createSignedUrl(r.file_path, 120);

    if (error || !data) {
      return setMsg(
        "Could not open: " +
          (error?.message ?? "")
      );
    }

    window.open(
      data.signedUrl,
      "_blank"
    );
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  async function remove(r: Row) {
    if (
      !confirm(
        "Delete " +
          r.title +
          "? The PDF is removed too."
      )
    ) {
      return;
    }

    if (r.file_path) {
      await supabase.storage
        .from("materials")
        .remove([r.file_path]);
    }

    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", r.id);

    if (error) {
      setMsg(error.message);
      return;
    }

    loadMaterials();
  }

  // ------------------------------------------------------------
  // ASSESSMENT LABEL
  // ------------------------------------------------------------

  function assessmentLabel(slug: string | null) {
    if (!slug) return "—";

    const found = assessmentTypes.find(
      (a) => a.slug === slug
    );

    return found?.name ?? slug;
  }

  // ------------------------------------------------------------
  // ACCESS STATES
  // ------------------------------------------------------------

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">
            Access denied
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            {denied}
          </p>

          <a
            href="/admin"
            className="mt-6 inline-block text-sm text-indigo-600"
          >
            Back to login
          </a>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading...
      </main>
    );
  }

  // ------------------------------------------------------------
  // STUDY YEAR OPTIONS
  // ------------------------------------------------------------

  const studyYears = Array.from(
    new Set(
      semesters
        .map((s) => Number(s.year_number))
        .filter(
          (n) => n >= 1 && n <= 4
        )
    )
  ).sort((a, b) => a - b);

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
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#0b1020] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold">
            Materials
          </p>

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

        {/* -------------------------------------------------- */}
        {/* LOCATION */}
        {/* -------------------------------------------------- */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold">
            Choose where it belongs
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((p) => (
              <label
                key={p.label}
                className="block"
              >
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  {p.label}
                </span>

                <select
                  value={p.value}
                  onChange={(e) =>
                    p.set(e.target.value)
                  }
                  disabled={p.disabled}
                  className="field"
                >
                  <option value="">
                    Select
                  </option>

                  {p.rows.map((r: Row) => (
                    <option
                      key={r.id}
                      value={r.id}
                    >
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {/* STUDY YEAR */}
          {branchId && isBtech && (
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Study Year
                </span>

                <select
                  value={yearNumber}
                  onChange={(e) => {
                    setYearNumber(
                      e.target.value
                    );
                    setSemesterId("");
                    setSubjectId("");
                    setRows([]);
                    setIsCommonFirstYear(false);
                  }}
                  className="field"
                >
                  <option value="">
                    Select study year
                  </option>

                  {studyYears.map((y) => (
                    <option
                      key={y}
                      value={String(y)}
                    >
                      {y === 1
                        ? "1st Year"
                        : y === 2
                        ? "2nd Year"
                        : y === 3
                        ? "3rd Year"
                        : "4th Year"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* SEMESTER */}
          {branchId && (
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Semester
                </span>

                <select
                  value={semesterId}
                  onChange={(e) => {
                    setSemesterId(
                      e.target.value
                    );
                  }}
                  disabled={
                    isBtech
                      ? !yearNumber
                      : !branchId
                  }
                  className="field"
                >
                  <option value="">
                    {isBtech &&
                    !yearNumber
                      ? "Select study year first"
                      : "Select semester"}
                  </option>

                  {semesters
                    .filter((s) =>
                      isBtech
                        ? Number(
                            s.year_number
                          ) ===
                          Number(
                            yearNumber
                          )
                        : true
                    )
                    .map((s: Row) => (
                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          )}

          {/* SUBJECT */}
          {semesterId && (
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Subject
                </span>

                <select
                  value={subjectId}
                  onChange={(e) =>
                    setSubjectId(
                      e.target.value
                    )
                  }
                  className="field"
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map(
                    (s: Row) => (
                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                        {s.subject_code
                          ? " - " +
                            s.subject_code
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          )}
        </section>

        {/* -------------------------------------------------- */}
        {/* UPLOAD */}
        {/* -------------------------------------------------- */}

        {subjectId && (
          <form
            onSubmit={upload}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-sm font-semibold">
              Upload a PDF
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* TITLE */}
              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Title, e.g. CAE 1 2024 paper"
                className="field"
              />

              {/* ACADEMIC YEAR */}
              <input
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
                placeholder="Academic year, e.g. 2024-25"
                className="field"
              />

              {/* MATERIAL TYPE */}
              <select
                value={materialType}
                onChange={(e) =>
                  setMaterialType(
                    e.target.value
                  )
                }
                className="field"
              >
                {MATERIAL_TYPES.map(
                  (m) => (
                    <option
                      key={m.value}
                      value={m.value}
                    >
                      {m.label}
                    </option>
                  )
                )}
              </select>

              {/* COLLEGE-SPECIFIC ASSESSMENT */}
              <select
                value={examType}
                onChange={(e) =>
                  setExamType(
                    e.target.value
                  )
                }
                disabled={
                  !collegeId ||
                  assessmentTypes.length ===
                    0
                }
                className="field"
              >
                <option value="">
                  {assessmentTypes.length ===
                  0
                    ? "No assessments configured"
                    : "Select assessment"}
                </option>

                {assessmentTypes.map(
                  (a: Row) => (
                    <option
                      key={a.id}
                      value={a.slug}
                    >
                      {a.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <input
              id="pdfInput"
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ??
                    null
                )
              }
              className="mt-4 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:text-white"
            />

            <label className="mt-4 flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) =>
                  setPublish(
                    e.target.checked
                  )
                }
              />

              Publish immediately
            </label>

            {isBtechYear1 && (
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={
                    isCommonFirstYear
                  }
                  onChange={(e) =>
                    setIsCommonFirstYear(
                      e.target.checked
                    )
                  }
                />

                Common to all B.Tech branches
                — 1st Year
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary mt-5"
            >
              {busy
                ? "Uploading..."
                : "Upload material"}
            </button>
          </form>
        )}

        {/* -------------------------------------------------- */}
        {/* MATERIALS */}
        {/* -------------------------------------------------- */}

        {subjectId && (
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <p className="text-sm font-semibold">
                Materials in this subject (
                {rows.length})
              </p>
            </div>

            {rows.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500">
                Nothing yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className="px-6 py-4"
                  >
                    {editId === r.id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            value={eTitle}
                            onChange={(e) =>
                              setETitle(
                                e.target.value
                              )
                            }
                            className="field"
                          />

                          <input
                            value={eYear}
                            onChange={(e) =>
                              setEYear(
                                e.target.value
                              )
                            }
                            placeholder="Academic year"
                            className="field"
                          />

                          <select
                            value={eType}
                            onChange={(e) =>
                              setEType(
                                e.target.value
                              )
                            }
                            className="field"
                          >
                            {MATERIAL_TYPES.map(
                              (m) => (
                                <option
                                  key={m.value}
                                  value={m.value}
                                >
                                  {m.label}
                                </option>
                              )
                            )}
                          </select>

                          <select
                            value={eExam}
                            onChange={(e) =>
                              setEExam(
                                e.target.value
                              )
                            }
                            className="field"
                          >
                            <option value="">
                              Select assessment
                            </option>

                            {assessmentTypes.map(
                              (a: Row) => (
                                <option
                                  key={a.id}
                                  value={a.slug}
                                >
                                  {a.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={
                              saveEdit
                            }
                            className="btn-primary"
                          >
                            Save changes
                          </button>

                          <button
                            onClick={() =>
                              setEditId("")
                            }
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
                              {r.is_published
                                ? "live"
                                : "draft"}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {labelOf(
                              MATERIAL_TYPES,
                              r.material_type
                            )}

                            {" | "}

                            {assessmentLabel(
                              r.exam_type
                            )}

                            {r.academic_year
                              ? " | " +
                                r.academic_year
                              : ""}

                            {" | "}

                            {r.view_count ??
                              0}{" "}
                            views
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() =>
                              preview(r)
                            }
                            className="text-xs font-medium text-slate-600 hover:underline"
                          >
                            Preview
                          </button>

                          <button
                            onClick={() => {
                              setEditId(
                                r.id
                              );
                              setETitle(
                                r.title ??
                                  ""
                              );
                              setEType(
                                r.material_type ??
                                  "paper"
                              );
                              setEExam(
                                r.exam_type ??
                                  ""
                              );
                              setEYear(
                                r.academic_year ??
                                  ""
                              );
                            }}
                            className="text-xs font-medium text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              togglePublish(
                                r
                              )
                            }
                            className="text-xs font-medium text-slate-600 hover:underline"
                          >
                            {r.is_published
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            onClick={() =>
                              toggleDownload(
                                r
                              )
                            }
                            className="text-xs font-medium hover:underline"
                          >
                            {r.allow_download
                              ? "Disable download"
                              : "Enable download"}
                          </button>

                          <button
                            onClick={() =>
                              remove(r)
                            }
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
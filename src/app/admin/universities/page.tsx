"use client";

import { useEffect, useState } from "react";
import { supabase, makeSlug } from "@/lib/supabase";

type Row = Record<string, any>;

export default function UniversitiesPage() {
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState("");
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [state, setState] = useState("");

  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editShort, setEditShort] = useState("");
  const [editState, setEditState] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("universities")
      .select("id, name, short_name, state, slug, is_active")
      .order("name");
    if (error) setMsg("Could not load: " + error.message);
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
      await load();
      setReady(true);
    }
    init();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!name.trim()) return setMsg("Enter a university name.");

    const { error } = await supabase.from("universities").insert({
      name: name.trim(),
      slug: makeSlug(name),
      short_name: shortName.trim() || null,
      state: state.trim() || null,
      is_active: true,
    });
    if (error) return setMsg("Could not save: " + error.message);

    setName("");
    setShortName("");
    setState("");
    setMsg("Saved.");
    await load();
  }

  function startEdit(r: Row) {
    setEditId(r.id);
    setEditName(r.name ?? "");
    setEditShort(r.short_name ?? "");
    setEditState(r.state ?? "");
  }

  async function saveEdit() {
    if (!editName.trim()) return setMsg("Name cannot be empty.");
    const { error } = await supabase
      .from("universities")
      .update({
        name: editName.trim(),
        slug: makeSlug(editName),
        short_name: editShort.trim() || null,
        state: editState.trim() || null,
      })
      .eq("id", editId);
    if (error) return setMsg("Could not update: " + error.message);
    setEditId("");
    setMsg("Updated.");
    await load();
  }

  async function toggle(r: Row) {
    const { error } = await supabase
      .from("universities")
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    if (error) return setMsg("Could not update: " + error.message);
    await load();
  }

  async function remove(r: Row) {
    if (!confirm("Delete " + r.name + "? Everything inside it goes too.")) return;
    const { error } = await supabase.from("universities").delete().eq("id", r.id);
    if (error) return setMsg("Could not delete: " + error.message);
    await load();
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
          <p className="text-sm font-semibold">Universities</p>
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

        <form
          onSubmit={add}
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-sm font-semibold">Add a university</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="University name"
              className="field"
            />
            <input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Short name"
              className="field"
            />
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="field"
            />
          </div>
          <button type="submit" className="btn-primary mt-4">
            Add university
          </button>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <p className="text-sm font-semibold">
              All universities ({rows.length})
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-500">Nothing added yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {rows.map((r) => (
                <li key={r.id} className="px-6 py-4">
                  {editId === r.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="field"
                        />
                        <input
                          value={editShort}
                          onChange={(e) => setEditShort(e.target.value)}
                          placeholder="Short name"
                          className="field"
                        />
                        <input
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          placeholder="State"
                          className="field"
                        />
                      </div>
                      <div className="flex gap-3">
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
                          {r.name}
                          {r.is_active === false && (
                            <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              hidden
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {r.short_name ?? "-"}
                          {r.state ? " | " + r.state : ""}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => startEdit(r)}
                          className="text-xs font-medium text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggle(r)}
                          className="text-xs font-medium text-slate-600 hover:underline"
                        >
                          {r.is_active === false ? "Show" : "Hide"}
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
      </div>
    </main>
  );
}

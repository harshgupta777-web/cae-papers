"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  supabase,
  MATERIAL_TYPES,
  EXAM_TYPES,
  labelOf,
} from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";

type Row = Record<string, any>;

export default function ViewMaterialPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [material, setMaterial] = useState<Row | null>(null);
  const [url, setUrl] = useState("");
  const [related, setRelated] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data, error: err } = await supabase
        .from("materials")
        .select(
          "id, title, material_type, exam_type, academic_year, file_path, allow_download, subject_id, subjects!materials_subject_id_fkey(name, subject_code)"
        )
        .eq("id", id)
        .maybeSingle();

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("This material is not available.");
        setLoading(false);
        return;
      }

      setMaterial(data);

      const { data: more } = await supabase
        .from("materials")
        .select("id, title, material_type")
        .eq("subject_id", data.subject_id)
        .eq("is_published", true)
        .neq("id", id)
        .limit(6);

      setRelated(more ?? []);

      if (!data.file_path) {
        setError("No file attached to this material yet.");
        setLoading(false);
        return;
      }

      const { data: signed, error: signErr } = await supabase.storage
        .from("materials")
        .createSignedUrl(data.file_path, 600);

      if (signErr || !signed) {
        setError(
          "Could not open this file. " + (signErr?.message ?? "")
        );
        setLoading(false);
        return;
      }

      setUrl(
        signed.signedUrl +
          "#toolbar=0&navpanes=0&statusbar=0"
      );

      supabase.rpc("increment_material_view", {
        material_id: id,
      });

      setLoading(false);
    }

    if (id) load();
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <Link
          href="/search"
          className="text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          Back to results
        </Link>

        {material && (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {material.title}
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                {material.subjects?.name}
                {material.subjects?.subject_code
                  ? " - " + material.subjects.subject_code
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
                {labelOf(
                  MATERIAL_TYPES,
                  material.material_type
                )}
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">
                {labelOf(
                  EXAM_TYPES,
                  material.exam_type
                )}
              </span>

              {material.academic_year && (
                <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">
                  {material.academic_year}
                </span>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 h-[70vh] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold">
              Not available
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              {error}
            </p>

            <Link
              href="/"
              className="btn-primary mt-7 inline-block"
            >
              Back to home
            </Link>
          </div>
        )}

        {url && !error && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_260px]">
            <div
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              onContextMenu={(e) =>
                e.preventDefault()
              }
            >
              <iframe
                src={url}
                title={material?.title ?? "Material"}
                className="h-[82vh] w-full"
              />
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Viewing
                </p>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  This file is opened through a temporary
                  secure link that expires on its own. It is
                  meant for reading here, not for sharing
                  outside.
                </p>
              </div>

              {material.allow_download && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Download available
                  </p>

                  <a
                    href={url.split("#")[0]}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    📥 Download PDF
                  </a>

                  <p className="mt-3 text-xs leading-relaxed text-emerald-700">
                    This download link is temporary and
                    expires automatically.
                  </p>
                </div>
              )}

              {related.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    More in this subject
                  </p>

                  <div className="mt-3 flex flex-col gap-3">
                    {related.map((r) => (
                      <Link
                        key={r.id}
                        href={"/view/" + r.id}
                        className="text-sm text-slate-700 hover:text-indigo-600"
                      >
                        {r.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
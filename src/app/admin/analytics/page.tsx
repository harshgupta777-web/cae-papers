"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventRow = {
  id: number;
  event_type: string;
  material_id: string | null;
  page_path: string | null;
  search_query: string | null;
  result_count: number | null;
  created_at: string;
};

type MaterialRow = {
  id: string;
  title: string;
};

type RangeKey = "today" | "7d" | "30d" | "all";

const RANGES: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
];

function getStartDate(range: RangeKey) {
  if (range === "all") return null;

  const date = new Date();

  if (range === "today") {
    date.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    date.setDate(date.getDate() - 7);
  } else {
    date.setDate(date.getDate() - 30);
  }

  return date.toISOString();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

export default function AnalyticsPage() {
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState("");
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("7d");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        window.location.href = "/admin";
        return;
      }

      const { data: adminRows, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id);

      if (adminError) {
        setDenied("Database error: " + adminError.message);
        return;
      }

      if (!adminRows || adminRows.length === 0) {
        setDenied("This account is not an admin.");
        return;
      }

      setEmail(user.email ?? "");
      setReady(true);
    }

    init();
  }, []);

  useEffect(() => {
    if (!ready) return;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      const startDate = getStartDate(range);

      let query = supabase
        .from("analytics_events")
        .select(
          "id, event_type, material_id, page_path, search_query, result_count, created_at"
        )
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      const { data, error: eventError } = await query;

      if (eventError) {
        setError(eventError.message);
        setLoading(false);
        return;
      }

      const eventRows = (data ?? []) as EventRow[];
      setEvents(eventRows);

      const materialIds = Array.from(
        new Set(
          eventRows
            .map((event) => event.material_id)
            .filter(Boolean) as string[]
        )
      );

      if (materialIds.length > 0) {
        const { data: materialData, error: materialError } = await supabase
          .from("materials")
          .select("id, title")
          .in("id", materialIds);

        if (materialError) {
          setError(materialError.message);
          setLoading(false);
          return;
        }

        setMaterials(materialData ?? []);
      } else {
        setMaterials([]);
      }

      setLoading(false);
    }

    loadAnalytics();
  }, [ready, range]);

  const materialMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const material of materials) {
      map.set(material.id, material.title);
    }

    return map;
  }, [materials]);

  const counts = useMemo(() => {
    return {
      visits: events.filter(
        (event) => event.event_type === "page_view"
      ).length,

      pdfViews: events.filter(
        (event) => event.event_type === "pdf_view"
      ).length,

      downloads: events.filter(
        (event) => event.event_type === "pdf_download"
      ).length,

      searches: events.filter(
        (event) => event.event_type === "search"
      ).length,
    };
  }, [events]);

  const downloaded = useMemo(() => {
    const map = new Map<
      string,
      { materialId: string; count: number }
    >();

    for (const event of events) {
      if (
        event.event_type !== "pdf_download" ||
        !event.material_id
      ) {
        continue;
      }

      const current = map.get(event.material_id);

      map.set(event.material_id, {
        materialId: event.material_id,
        count: (current?.count ?? 0) + 1,
      });
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const viewed = useMemo(() => {
    const map = new Map<
      string,
      { materialId: string; count: number }
    >();

    for (const event of events) {
      if (
        event.event_type !== "pdf_view" ||
        !event.material_id
      ) {
        continue;
      }

      const current = map.get(event.material_id);

      map.set(event.material_id, {
        materialId: event.material_id,
        count: (current?.count ?? 0) + 1,
      });
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const searches = useMemo(() => {
    const map = new Map<
      string,
      {
        query: string;
        count: number;
        totalResults: number;
      }
    >();

    for (const event of events) {
      if (
        event.event_type !== "search" ||
        !event.search_query
      ) {
        continue;
      }

      const query = event.search_query.trim().toLowerCase();

      if (!query) continue;

      const current = map.get(query);

      map.set(query, {
        query,
        count: (current?.count ?? 0) + 1,
        totalResults:
          (current?.totalResults ?? 0) +
          (event.result_count ?? 0),
      });
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const noResultSearches = useMemo(() => {
    const map = new Map<
      string,
      {
        query: string;
        count: number;
      }
    >();

    for (const event of events) {
      if (
        event.event_type !== "search" ||
        !event.search_query ||
        event.result_count !== 0
      ) {
        continue;
      }

      const query = event.search_query.trim().toLowerCase();

      if (!query) continue;

      const current = map.get(query);

      map.set(query, {
        query,
        count: (current?.count ?? 0) + 1,
      });
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const activity = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        visits: number;
        views: number;
        downloads: number;
        searches: number;
      }
    >();

    for (const event of events) {
      const date = new Date(event.created_at).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
        }
      );

      const current = map.get(date) ?? {
        date,
        visits: 0,
        views: 0,
        downloads: 0,
        searches: 0,
      };

      if (event.event_type === "page_view") {
        current.visits++;
      } else if (event.event_type === "pdf_view") {
        current.views++;
      } else if (event.event_type === "pdf_download") {
        current.downloads++;
      } else if (event.event_type === "search") {
        current.searches++;
      }

      map.set(date, current);
    }

    return Array.from(map.values()).slice(0, 14).reverse();
  }, [events]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

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
        Loading analytics...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#0b1020] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold">
              CP
            </span>

            <div>
              <p className="text-sm font-semibold">
                Analytics
              </p>

              <p className="text-xs text-slate-400">
                {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              Dashboard
            </a>

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

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Site analytics
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Understand what students are viewing, downloading
              and searching for.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {RANGES.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition " +
                  (range === item.value
                    ? "border-[#0b1020] bg-[#0b1020] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400")
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading analytics...
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Site visits",
                  value: counts.visits,
                },
                {
                  label: "PDF views",
                  value: counts.pdfViews,
                },
                {
                  label: "Downloads",
                  value: counts.downloads,
                },
                {
                  label: "Searches",
                  value: counts.searches,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-2xl font-semibold tracking-tight">
                    {formatNumber(item.value)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Activity */}
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-sm font-semibold">
                  Activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recent activity in the selected period.
                </p>
              </div>

              {activity.length === 0 ? (
                <p className="mt-8 text-center text-sm text-slate-500">
                  No activity yet.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {activity.map((day) => {
                    const total =
                      day.visits +
                      day.views +
                      day.downloads +
                      day.searches;

                    const width = Math.max(
                      4,
                      Math.min(100, total * 4)
                    );

                    return (
                      <div key={day.date}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">
                            {day.date}
                          </span>

                          <span className="text-slate-400">
                            {total} events
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: width + "%" }}
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                          <span>
                            Visits {day.visits}
                          </span>
                          <span>
                            Views {day.views}
                          </span>
                          <span>
                            Downloads {day.downloads}
                          </span>
                          <span>
                            Searches {day.searches}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Downloads */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold">
                  Most downloaded PDFs
                </h2>

                <div className="mt-5 space-y-3">
                  {downloaded.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No downloads yet.
                    </p>
                  ) : (
                    downloaded.map((item, index) => (
                      <div
                        key={item.materialId}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {index + 1}.{" "}
                            {materialMap.get(
                              item.materialId
                            ) ?? "Deleted material"}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-semibold text-indigo-600">
                          {item.count} downloads
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Views */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold">
                  Most viewed PDFs
                </h2>

                <div className="mt-5 space-y-3">
                  {viewed.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No PDF views yet.
                    </p>
                  ) : (
                    viewed.map((item, index) => (
                      <div
                        key={item.materialId}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                      >
                        <p className="min-w-0 truncate text-sm font-medium">
                          {index + 1}.{" "}
                          {materialMap.get(
                            item.materialId
                          ) ?? "Deleted material"}
                        </p>

                        <span className="shrink-0 text-xs font-semibold text-indigo-600">
                          {item.count} views
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Searches */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold">
                  Most searched
                </h2>

                <div className="mt-5 space-y-3">
                  {searches.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No searches yet.
                    </p>
                  ) : (
                    searches.map((item, index) => (
                      <div
                        key={item.query}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                      >
                        <p className="truncate text-sm font-medium">
                          {index + 1}. {item.query}
                        </p>

                        <span className="shrink-0 text-xs text-slate-500">
                          {item.count} searches
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* No results */}
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-sm font-semibold text-amber-900">
                  Students searched — nothing found
                </h2>

                <p className="mt-1 text-xs text-amber-700">
                  These searches may show you what content to
                  upload next.
                </p>

                <div className="mt-5 space-y-3">
                  {noResultSearches.length === 0 ? (
                    <p className="text-sm text-amber-700">
                      No zero-result searches yet.
                    </p>
                  ) : (
                    noResultSearches.map((item, index) => (
                      <div
                        key={item.query}
                        className="flex items-center justify-between gap-4 border-b border-amber-200 pb-3 last:border-0"
                      >
                        <p className="truncate text-sm font-medium text-amber-900">
                          {index + 1}. {item.query}
                        </p>

                        <span className="shrink-0 text-xs font-semibold text-amber-700">
                          {item.count} searches
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold">
                Analytics privacy
              </p>

              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                This dashboard uses anonymous activity events.
                It does not need student names, emails or
                passwords. Only administrators can read these
                analytics.
              </p>

              <p className="mt-3 text-xs text-slate-400">
                {events.length} events loaded · Updated{" "}
                {events.length > 0
                  ? formatDate(events[0].created_at)
                  : "now"}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
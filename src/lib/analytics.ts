import { supabase } from "./supabase";

type AnalyticsEvent = {
  event_type: "page_view" | "pdf_view" | "pdf_download" | "search";
  material_id?: string | null;
  page_path?: string | null;
  search_query?: string | null;
  result_count?: number | null;
};

export async function trackEvent(event: AnalyticsEvent) {
  try {
    await supabase.from("analytics_events").insert({
      event_type: event.event_type,
      material_id: event.material_id ?? null,
      page_path: event.page_path ?? null,
      search_query: event.search_query ?? null,
      result_count: event.result_count ?? null,
    });
  } catch (error) {
    // Analytics must never break the website.
    console.error("Analytics error:", error);
  }
}
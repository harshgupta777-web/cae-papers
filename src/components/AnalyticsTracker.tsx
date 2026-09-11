"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Don't count admin activity as public site visits.
    if (pathname.startsWith("/admin")) return;

    trackEvent({
      event_type: "page_view",
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
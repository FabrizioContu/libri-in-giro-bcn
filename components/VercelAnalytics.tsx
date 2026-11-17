"use client";

import { Analytics } from "@vercel/analytics/next";
import { sanitizeAnalyticsEvent } from "@/lib/analytics";

// Wrapper client: beforeSend è una funzione e non può passare dal layout
// (Server Component) a un Client Component come prop.
export function VercelAnalytics() {
  return <Analytics beforeSend={sanitizeAnalyticsEvent} />;
}

import type { BeforeSendEvent } from "@vercel/analytics";

// Pagine riservate al gestore: non sono traffico degli utenti, non vanno contate.
const EXCLUDED_PATHS = [/^\/admin(\/|$)/];

// Unici parametri che possono arrivare a Vercel: servono a capire da quale
// gruppo/canale arrivano le visite (es. ?utm_source=fb-italiani-bcn).
const ALLOWED_PARAMS = ["utm_source", "utm_medium", "utm_campaign"];

// Le query string contengono segreti (?token=<edit_token> nelle pagine
// /gestisci, ?secret= in /admin): NON devono mai arrivare a Vercel Analytics.
// Allowlist, non blocklist: qualsiasi parametro non previsto viene scartato.
// In caso di URL malformato l'evento viene scartato (fail-closed): meglio
// perdere una visita che inviare un token.
export function sanitizeAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const withoutHash = event.url.split("#", 1)[0];
    const queryStart = withoutHash.indexOf("?");
    const base = queryStart === -1 ? withoutHash : withoutHash.slice(0, queryStart);

    const { pathname } = new URL(base, "http://localhost");
    if (EXCLUDED_PATHS.some((pattern) => pattern.test(pathname))) return null;

    const params = new URLSearchParams(queryStart === -1 ? "" : withoutHash.slice(queryStart + 1));
    const kept = new URLSearchParams();
    for (const key of ALLOWED_PARAMS) {
      const value = params.get(key);
      if (value) kept.set(key, value);
    }

    const query = kept.toString();
    return { ...event, url: query ? `${base}?${query}` : base };
  } catch {
    return null;
  }
}

// Unica fonte di verità per gli host delle copertine: la usano next.config
// (remotePatterns di next/image), la validazione server e i form.
export const COVER_HOSTS = ["covers.openlibrary.org", "books.google.com"] as const;

export function isAllowedCoverUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (COVER_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
}

export const COVER_URL_ERROR =
  "Usa un link di copertina da Open Library o Google Books (oppure lascia vuoto).";

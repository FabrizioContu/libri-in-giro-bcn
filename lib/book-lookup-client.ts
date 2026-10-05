import type { IsbnLookupResult } from "./isbn-lookup";

export type IsbnSearchResult =
  | { status: "found"; book: IsbnLookupResult }
  | { status: "not_found" }
  | { status: "error" };

export async function searchIsbn(isbn: string): Promise<IsbnSearchResult> {
  try {
    const res = await fetch(`/api/lookup/isbn?isbn=${encodeURIComponent(isbn)}`);
    if (res.status === 404) return { status: "not_found" };
    if (!res.ok) return { status: "error" };
    return { status: "found", book: await res.json() };
  } catch {
    return { status: "error" };
  }
}

export async function searchCover(titolo: string, autore: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ titolo: titolo.trim(), autore: autore.trim() });
    const res = await fetch(`/api/lookup/cover?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.copertina_url ?? null;
  } catch {
    return null;
  }
}

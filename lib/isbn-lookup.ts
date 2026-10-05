export const ISBN13_RE = /^97[89]\d{10}$/;

export interface IsbnLookupResult {
  titolo: string;
  autore: string;
  copertina_url: string | null;
}

const TIMEOUT_MS = 5000;

// Senza ?default=false Open Library risponde 200 con un GIF trasparente 1x1
// quando la copertina non esiste: il form mostrava "Copertina dall'ISBN" vuota.
// Con default=false risponde 404, e il 302 verso archive.org indica che esiste.
async function openLibraryCover(isbn: string): Promise<string | null> {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.status >= 200 && res.status < 400 ? url : null;
  } catch {
    return null;
  }
}

async function fromOpenLibrary(isbn: string): Promise<IsbnLookupResult | null> {
  const res = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) }
  );
  if (!res.ok) throw new Error(`Open Library ${res.status}`);
  const book = (await res.json())[`ISBN:${isbn}`];
  if (!book) return null;
  return {
    titolo: book.title ?? "",
    autore: book.authors?.[0]?.name ?? "",
    // ISBN-based cover URL is more reliable than the OLID-based one returned by the API
    copertina_url: await openLibraryCover(isbn),
  };
}

async function fromGoogleBooks(isbn: string): Promise<IsbnLookupResult | null> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) }
  );
  if (!res.ok) throw new Error(`Google Books ${res.status}`);
  const book = (await res.json()).items?.[0]?.volumeInfo;
  if (!book) return null;
  return {
    titolo: book.title ?? "",
    autore: book.authors?.[0] ?? "",
    copertina_url: book.imageLinks?.thumbnail?.replace("http:", "https:") ?? null,
  };
}

// Ritorna null se nessuna fonte conosce l'ISBN. Lancia solo se TUTTE le fonti
// sono in errore: Google Books senza API key va spesso in 429 (quota condivisa
// per IP del server) e un "riprova" lì non servirebbe a nulla.
export async function lookupBookByIsbn(isbn: string): Promise<IsbnLookupResult | null> {
  let failures = 0;
  const sources = [fromOpenLibrary, fromGoogleBooks];
  for (const source of sources) {
    try {
      const book = await source(isbn);
      if (book) return book;
    } catch {
      failures++;
    }
  }
  if (failures === sources.length) throw new Error("All ISBN sources failed");
  return null;
}

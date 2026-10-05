import { NextRequest, NextResponse } from "next/server";
import { ISBN13_RE, lookupBookByIsbn } from "@/lib/isbn-lookup";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

// Proxy server-side verso Open Library / Google Books: il browser parla solo
// con il nostro dominio, così la CSP connect-src resta chiusa ai terzi.
export async function GET(req: NextRequest) {
  const isbn = (req.nextUrl.searchParams.get("isbn") ?? "").replace(/[-\s]/g, "");
  if (!ISBN13_RE.test(isbn)) {
    return NextResponse.json({ error: "invalid_isbn" }, { status: 400 });
  }

  try {
    const book = await lookupBookByIsbn(isbn);
    if (!book) return NextResponse.json({ error: "not_found" }, { status: 404 });
    // Edizione senza copertina: spesso un'altra edizione dello stesso libro ce l'ha.
    if (!book.copertina_url && book.titolo && book.autore) {
      book.copertina_url = await fetchCoverByTitleAuthor(book.titolo, book.autore);
    }
    return NextResponse.json(book, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}

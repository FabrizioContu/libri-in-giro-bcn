import { NextRequest, NextResponse } from "next/server";
import { ISBN13_RE, lookupBookByIsbn } from "@/lib/isbn-lookup";

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
    return NextResponse.json(book, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}

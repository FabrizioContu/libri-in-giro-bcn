import { NextRequest, NextResponse } from "next/server";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

export async function GET(req: NextRequest) {
  const titolo = (req.nextUrl.searchParams.get("titolo") ?? "").trim();
  const autore = (req.nextUrl.searchParams.get("autore") ?? "").trim();
  if (titolo.length < 3 || autore.length < 2 || titolo.length > 200 || autore.length > 200) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const copertina_url = await fetchCoverByTitleAuthor(titolo, autore);
  return NextResponse.json(
    { copertina_url },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
}

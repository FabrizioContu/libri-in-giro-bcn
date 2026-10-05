// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/isbn-lookup", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/isbn-lookup")>()),
  lookupBookByIsbn: vi.fn(),
}));
vi.mock("@/lib/cover-search", () => ({ fetchCoverByTitleAuthor: vi.fn() }));

import { GET as getIsbn } from "@/app/api/lookup/isbn/route";
import { GET as getCover } from "@/app/api/lookup/cover/route";
import { lookupBookByIsbn } from "@/lib/isbn-lookup";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

const req = (path: string) => new NextRequest(`http://localhost${path}`);

describe("GET /api/lookup/isbn", () => {
  beforeEach(() => vi.mocked(lookupBookByIsbn).mockReset());

  it("rejects malformed ISBNs without calling upstream", async () => {
    const res = await getIsbn(req("/api/lookup/isbn?isbn=hello"));
    expect(res.status).toBe(400);
    expect(lookupBookByIsbn).not.toHaveBeenCalled();
  });

  it("normalises dashes and returns the book", async () => {
    const book = { titolo: "T", autore: "A", copertina_url: null };
    vi.mocked(lookupBookByIsbn).mockResolvedValueOnce(book);

    const res = await getIsbn(req("/api/lookup/isbn?isbn=978-88-04-66823-7"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(book);
    expect(lookupBookByIsbn).toHaveBeenCalledWith("9788804668237");
  });

  it("returns 404 when the ISBN is unknown", async () => {
    vi.mocked(lookupBookByIsbn).mockResolvedValueOnce(null);
    const res = await getIsbn(req("/api/lookup/isbn?isbn=9788804668237"));
    expect(res.status).toBe(404);
  });

  it("returns 502 when upstream fails", async () => {
    vi.mocked(lookupBookByIsbn).mockRejectedValueOnce(new Error("down"));
    const res = await getIsbn(req("/api/lookup/isbn?isbn=9788804668237"));
    expect(res.status).toBe(502);
  });
});

describe("GET /api/lookup/cover", () => {
  beforeEach(() => vi.mocked(fetchCoverByTitleAuthor).mockReset());

  it.each([
    "/api/lookup/cover",
    "/api/lookup/cover?titolo=ab&autore=Eco",
    "/api/lookup/cover?titolo=Il%20nome&autore=E",
    `/api/lookup/cover?titolo=${"x".repeat(201)}&autore=Eco`,
  ])("rejects invalid query %s", async (path) => {
    const res = await getCover(req(path));
    expect(res.status).toBe(400);
    expect(fetchCoverByTitleAuthor).not.toHaveBeenCalled();
  });

  it("returns the cover URL found server-side", async () => {
    vi.mocked(fetchCoverByTitleAuthor).mockResolvedValueOnce(
      "https://covers.openlibrary.org/b/id/1-M.jpg"
    );
    const res = await getCover(req("/api/lookup/cover?titolo=Il%20nome%20della%20rosa&autore=Eco"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ copertina_url: "https://covers.openlibrary.org/b/id/1-M.jpg" });
  });
});

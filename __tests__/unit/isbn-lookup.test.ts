import { describe, it, expect, vi, beforeEach } from "vitest";
import nextConfig from "@/next.config";
import { lookupBookByIsbn, ISBN13_RE } from "@/lib/isbn-lookup";

const ISBN = "9788804668237";

const ok = (body: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });

describe("lookupBookByIsbn", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns Open Library data with the ISBN-based cover", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        ok({ [`ISBN:${ISBN}`]: { title: "Il nome della rosa", authors: [{ name: "Umberto Eco" }] } })
      )
    );

    expect(await lookupBookByIsbn(ISBN)).toEqual({
      titolo: "Il nome della rosa",
      autore: "Umberto Eco",
      copertina_url: `https://covers.openlibrary.org/b/isbn/${ISBN}-L.jpg`,
    });
  });

  it("falls back to Google Books and upgrades the thumbnail to https", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(ok({}))
        .mockResolvedValueOnce(
          ok({
            items: [
              {
                volumeInfo: {
                  title: "Sei personaggi",
                  authors: ["Pirandello"],
                  imageLinks: { thumbnail: "http://books.google.com/thumb.jpg" },
                },
              },
            ],
          })
        )
    );

    expect(await lookupBookByIsbn(ISBN)).toEqual({
      titolo: "Sei personaggi",
      autore: "Pirandello",
      copertina_url: "https://books.google.com/thumb.jpg",
    });
  });

  it("returns null when neither source knows the ISBN", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(ok({})).mockResolvedValueOnce(ok({ items: [] }))
    );

    expect(await lookupBookByIsbn(ISBN)).toBeNull();
  });

  it("treats a failing fallback as not-found when Open Library answered (Google 429)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(ok({}))
        .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
    );

    expect(await lookupBookByIsbn(ISBN)).toBeNull();
  });

  it("still uses Google Books when Open Library is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValueOnce(ok({ items: [{ volumeInfo: { title: "T", authors: ["A"] } }] }))
    );

    expect(await lookupBookByIsbn(ISBN)).toEqual({ titolo: "T", autore: "A", copertina_url: null });
  });

  it("throws only when every source fails, so callers can tell it apart from not-found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: () => Promise.resolve({}) })
    );

    await expect(lookupBookByIsbn(ISBN)).rejects.toThrow();
  });

  it("produces cover URLs only from hosts allowlisted for next/image", async () => {
    const allowed = new Set((nextConfig.images?.remotePatterns ?? []).map((p) => p.hostname));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(ok({ [`ISBN:${ISBN}`]: { title: "t", authors: [] } }))
    );
    const ol = await lookupBookByIsbn(ISBN);
    expect(allowed.has(new URL(ol!.copertina_url!).hostname)).toBe(true);

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(ok({}))
        .mockResolvedValueOnce(
          ok({ items: [{ volumeInfo: { title: "t", imageLinks: { thumbnail: "http://books.google.com/x" } } }] })
        )
    );
    const gb = await lookupBookByIsbn(ISBN);
    expect(allowed.has(new URL(gb!.copertina_url!).hostname)).toBe(true);
  });
});

describe("ISBN13_RE", () => {
  it.each(["9788804668237", "9791032305690"])("accepts %s", (isbn) => {
    expect(ISBN13_RE.test(isbn)).toBe(true);
  });

  it.each(["880466823X", "1234567890123", "978880466823", "97888046682370"])("rejects %s", (isbn) => {
    expect(ISBN13_RE.test(isbn)).toBe(false);
  });
});

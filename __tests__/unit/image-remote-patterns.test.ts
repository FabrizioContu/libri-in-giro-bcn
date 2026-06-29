import { describe, it, expect, vi, beforeEach } from "vitest";
import nextConfig from "@/next.config";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

// Con hostname "**" il route /_next/image diventa un open proxy: chiunque può
// forzare il server a fetchare URL arbitrarie (SSRF + abuso di banda). Questi
// test bloccano una regressione verso il wildcard.
const patterns = nextConfig.images?.remotePatterns ?? [];

describe("next/image remotePatterns — SSRF / open proxy hardening", () => {
  it("is a non-empty explicit allowlist", () => {
    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("contains NO wildcard hostname (a single '**' reopens the proxy)", () => {
    for (const p of patterns) {
      expect(p.hostname).not.toContain("*");
      expect(p.hostname).not.toBe("");
    }
  });

  it("allows https only — no plaintext http origins", () => {
    for (const p of patterns) {
      expect(p.protocol).toBe("https");
    }
  });

  it("allowlists exactly the two real cover hosts", () => {
    const hosts = patterns.map((p) => p.hostname).sort();
    expect(hosts).toEqual(["books.google.com", "covers.openlibrary.org"]);
  });
});

// Aggancio cover-search.ts <-> next.config.ts: ogni host da cui può arrivare
// una copertina DEVE stare nell'allowlist. Se si aggiunge una fonte nuova
// senza aggiornare remotePatterns, questo blocco diventa rosso.
describe("cover sources stay within the image allowlist", () => {
  const allowed = new Set(patterns.map((p) => p.hostname));

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("the OpenLibrary cover host is allowlisted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve({ docs: [{ cover_i: 1 }] }),
      })
    );

    const url = await fetchCoverByTitleAuthor("t", "a");
    expect(url).not.toBeNull();
    expect(allowed.has(new URL(String(url)).hostname)).toBe(true);
  });

  it("the Google Books cover host is allowlisted", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ docs: [] }) })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              items: [
                {
                  volumeInfo: {
                    imageLinks: { thumbnail: "http://books.google.com/x.jpg" },
                  },
                },
              ],
            }),
        })
    );

    const url = await fetchCoverByTitleAuthor("t", "a");
    expect(url).not.toBeNull();
    expect(allowed.has(new URL(String(url)).hostname)).toBe(true);
  });
});

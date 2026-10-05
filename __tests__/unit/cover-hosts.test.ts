import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config";
import { COVER_HOSTS, isAllowedCoverUrl } from "@/lib/cover-hosts";
import { libroSchema } from "@/lib/validation";

describe("isAllowedCoverUrl", () => {
  it.each([
    "https://covers.openlibrary.org/b/id/1-M.jpg",
    "https://covers.openlibrary.org/b/isbn/9788804668237-L.jpg?default=false",
    "https://books.google.com/books/content?id=x&printsec=frontcover",
  ])("accepts %s", (url) => {
    expect(isAllowedCoverUrl(url)).toBe(true);
  });

  it.each([
    "http://covers.openlibrary.org/b/id/1-M.jpg", // plaintext
    "https://upload.wikimedia.org/cover.jpg", // host fuori allowlist
    "https://covers.openlibrary.org.evil.com/x.jpg", // suffisso ingannevole
    "javascript:alert(1)",
    "not a url",
  ])("rejects %s", (url) => {
    expect(isAllowedCoverUrl(url)).toBe(false);
  });
});

describe("next.config stays in sync with COVER_HOSTS", () => {
  it("builds remotePatterns from the shared allowlist", () => {
    const hosts = (nextConfig.images?.remotePatterns ?? []).map((p) => p.hostname);
    expect(hosts).toEqual([...COVER_HOSTS]);
  });

  // covers.openlibrary.org risponde 302 verso archive.org: senza redirect
  // le copertine Open Library non caricano più.
  it("keeps following image redirects", () => {
    expect(nextConfig.images?.maximumRedirects).not.toBe(0);
  });
});

describe("libroSchema copertina_url", () => {
  const base = {
    titolo: "T",
    autore: "A",
    genere: "Narrativa",
    barrio: "Gràcia",
  };

  it("accepts an allowlisted cover or no cover", () => {
    expect(libroSchema.safeParse({ ...base, copertina_url: "https://covers.openlibrary.org/b/id/1-M.jpg" }).success).toBe(true);
    expect(libroSchema.safeParse({ ...base, copertina_url: null }).success).toBe(true);
  });

  it("rejects a cover from a host next/image cannot render", () => {
    expect(libroSchema.safeParse({ ...base, copertina_url: "https://upload.wikimedia.org/x.jpg" }).success).toBe(false);
  });
});

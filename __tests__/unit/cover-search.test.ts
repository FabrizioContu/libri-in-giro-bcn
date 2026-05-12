import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

describe("fetchCoverByTitleAuthor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns OpenLibrary cover URL when cover_i is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve({ docs: [{ cover_i: 12345 }] }),
      })
    );

    const result = await fetchCoverByTitleAuthor("Il nome della rosa", "Umberto Eco");
    expect(result).toBe("https://covers.openlibrary.org/b/id/12345-M.jpg");
  });

  it("falls back to Google Books when OpenLibrary has no cover_i", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ docs: [] }) })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              items: [
                {
                  volumeInfo: {
                    imageLinks: { thumbnail: "http://books.google.com/thumb.jpg" },
                  },
                },
              ],
            }),
        })
    );

    const result = await fetchCoverByTitleAuthor("Sei personaggi", "Pirandello");
    expect(result).toBe("https://books.google.com/thumb.jpg");
  });

  it("upgrades http to https in Google Books thumbnail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ docs: [] }) })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              items: [
                {
                  volumeInfo: {
                    imageLinks: { thumbnail: "http://books.google.com/cover.jpg" },
                  },
                },
              ],
            }),
        })
    );

    const result = await fetchCoverByTitleAuthor("test", "test");
    expect(result).toMatch(/^https:/);
  });

  it("returns null when neither API finds a cover", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ docs: [] }) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ items: [] }) })
    );

    const result = await fetchCoverByTitleAuthor("libro inesistente", "autore xyz");
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const result = await fetchCoverByTitleAuthor("test", "test");
    expect(result).toBeNull();
  });
});

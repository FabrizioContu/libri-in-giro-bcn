import { describe, it, expect } from "vitest";
import { sanitizeAnalyticsEvent } from "@/lib/analytics";

// Le pagine /gestisci ricevono l'edit_token in query string e /admin il secret:
// questi test bloccano qualsiasi regressione che li invii a Vercel Analytics.
const SITE = "https://libri-in-giro-bcn.vercel.app";

describe("sanitizeAnalyticsEvent", () => {
  it("strips the edit token from book management URLs", () => {
    const result = sanitizeAnalyticsEvent({
      type: "pageview",
      url: `${SITE}/libro/abc/gestisci?token=11111111-2222-3333-4444-555555555555`,
    });
    expect(result).toEqual({ type: "pageview", url: `${SITE}/libro/abc/gestisci` });
  });

  it("strips the edit token from loan management URLs", () => {
    const result = sanitizeAnalyticsEvent({
      type: "pageview",
      url: `${SITE}/prestito/xyz/gestisci?token=secret-token`,
    });
    expect(result?.url).toBe(`${SITE}/prestito/xyz/gestisci`);
  });

  it("strips the hash fragment", () => {
    const result = sanitizeAnalyticsEvent({ type: "pageview", url: `${SITE}/libro/abc#token=x` });
    expect(result?.url).toBe(`${SITE}/libro/abc`);
  });

  it("drops admin page views entirely", () => {
    expect(sanitizeAnalyticsEvent({ type: "pageview", url: `${SITE}/admin?secret=s3cr3t` })).toBeNull();
    expect(sanitizeAnalyticsEvent({ type: "pageview", url: `${SITE}/admin/libri` })).toBeNull();
  });

  it("keeps pages that only start with 'admin' in their name", () => {
    const result = sanitizeAnalyticsEvent({ type: "pageview", url: `${SITE}/administrazione` });
    expect(result?.url).toBe(`${SITE}/administrazione`);
  });

  it("keeps public pages unchanged", () => {
    const event = { type: "pageview" as const, url: `${SITE}/aggiungi` };
    expect(sanitizeAnalyticsEvent(event)).toEqual(event);
  });

  it("handles relative URLs", () => {
    const result = sanitizeAnalyticsEvent({ type: "pageview", url: "/libro/abc/gestisci?token=t" });
    expect(result?.url).toBe("/libro/abc/gestisci");
  });

  it("keeps campaign parameters to measure which channel brings visits", () => {
    const result = sanitizeAnalyticsEvent({
      type: "pageview",
      url: `${SITE}/?utm_source=fb-italiani-bcn&utm_medium=social&utm_campaign=lancio`,
    });
    expect(result?.url).toBe(
      `${SITE}/?utm_source=fb-italiani-bcn&utm_medium=social&utm_campaign=lancio`,
    );
  });

  it("keeps campaign parameters but drops the token next to them", () => {
    const result = sanitizeAnalyticsEvent({
      type: "pageview",
      url: `${SITE}/libro/abc/gestisci?token=leak-me&utm_source=telegram`,
    });
    expect(result?.url).toBe(`${SITE}/libro/abc/gestisci?utm_source=telegram`);
  });

  it("drops unknown parameters (allowlist, not blocklist)", () => {
    const result = sanitizeAnalyticsEvent({
      type: "pageview",
      url: `${SITE}/libro/abc?nuovo=1&fbclid=xyz&utm_term=libri`,
    });
    expect(result?.url).toBe(`${SITE}/libro/abc`);
  });

  it("never returns a URL that still contains the token", () => {
    const result = sanitizeAnalyticsEvent({
      type: "event",
      url: `${SITE}/libro/abc/gestisci?nuovo=1&token=leak-me`,
    });
    expect(result?.url ?? "").not.toContain("leak-me");
  });
});

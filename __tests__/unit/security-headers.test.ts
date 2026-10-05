import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config";

// Questi header hanno già rotto in silenzio lo scanner ISBN e l'autocompletamento:
// camera=() bloccava getUserMedia e connect-src bloccava le fetch verso terzi.
async function getHeader(key: string): Promise<string> {
  const rules = (await nextConfig.headers?.()) ?? [];
  const header = rules.flatMap((r) => r.headers).find((h) => h.key === key);
  if (!header) throw new Error(`${key} header missing`);
  return header.value;
}

describe("security headers keep the add-book flow working", () => {
  it("Permissions-Policy allows the camera for our own origin (ISBN scanner)", async () => {
    const policy = await getHeader("Permissions-Policy");
    expect(policy).toContain("camera=(self)");
    expect(policy).not.toContain("camera=()");
  });

  it("CSP connect-src does not open third-party book APIs — lookups go through /api/lookup", async () => {
    const csp = await getHeader("Content-Security-Policy");
    const connectSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("connect-src"));
    expect(connectSrc).toBeDefined();
    expect(connectSrc).not.toMatch(/openlibrary\.org|googleapis\.com/);
  });
});

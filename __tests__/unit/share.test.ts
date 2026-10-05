import { describe, it, expect } from "vitest";
import { buildShareLinks } from "@/lib/share";

const SITE = "https://libri.example";
const libro = {
  id: "abc-123",
  titolo: "Il nome della rosa",
  autore: "Umberto Eco",
  barrio: "Gràcia",
  disponibile: true,
};

describe("buildShareLinks", () => {
  it("points to the public book page", () => {
    expect(buildShareLinks(libro, SITE, "visitor").url).toBe(`${SITE}/libro/abc-123`);
  });

  it("uses a neutral invitation for visitors", () => {
    const { text } = buildShareLinks(libro, SITE, "visitor");
    expect(text).toBe('"Il nome della rosa" di Umberto Eco è disponibile in prestito a Gràcia su Libri in Giro BCN');
    expect(text).not.toMatch(/ho appena aggiunto/i);
  });

  it("does not claim availability when the book is on loan", () => {
    const { text } = buildShareLinks({ ...libro, disponibile: false }, SITE, "visitor");
    expect(text).not.toMatch(/disponibile/i);
  });

  it("keeps the 'just added' wording for the owner banner", () => {
    expect(buildShareLinks(libro, SITE, "owner").text).toMatch(/^Ho appena aggiunto/);
  });

  it("falls back to Barcellona when the barrio is missing", () => {
    expect(buildShareLinks({ ...libro, barrio: null }, SITE, "visitor").text).toContain("a Barcellona");
  });

  it("builds Telegram with url and text as separate params", () => {
    const tg = new URL(buildShareLinks(libro, SITE, "visitor").telegram);
    expect(tg.origin + tg.pathname).toBe("https://t.me/share/url");
    expect(tg.searchParams.get("url")).toBe(`${SITE}/libro/abc-123`);
    expect(tg.searchParams.get("text")).not.toContain(SITE);
  });

  it("builds WhatsApp with the link inside the text, safely encoded", () => {
    const wa = new URL(buildShareLinks({ ...libro, titolo: 'A & B "C"?' }, SITE, "visitor").whatsapp);
    expect(wa.origin).toBe("https://wa.me");
    const text = wa.searchParams.get("text")!;
    expect(text).toContain('"A & B "C"?"');
    expect(text.endsWith(`${SITE}/libro/abc-123`)).toBe(true);
  });
});

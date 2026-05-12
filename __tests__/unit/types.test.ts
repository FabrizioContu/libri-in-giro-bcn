import { describe, it, expect } from "vitest";
import { GENERE_STYLE, GENERE_EMOJI, GENERI, BARRIOS } from "@/lib/types";

describe("GENERE_STYLE", () => {
  it("has a style entry for every defined genre", () => {
    for (const g of GENERI) {
      expect(GENERE_STYLE[g], `missing style for "${g}"`).toBeDefined();
      expect(GENERE_STYLE[g].bg).toBeTruthy();
      expect(GENERE_STYLE[g].text).toBeTruthy();
    }
  });
});

describe("GENERE_EMOJI", () => {
  it("has an emoji for every defined genre", () => {
    for (const g of GENERI) {
      expect(GENERE_EMOJI[g], `missing emoji for "${g}"`).toBeDefined();
    }
  });
});

describe("BARRIOS", () => {
  it("is a non-empty list", () => {
    expect(BARRIOS.length).toBeGreaterThan(0);
  });
});

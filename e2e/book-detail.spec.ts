import { test, expect } from "@playwright/test";

test.describe("Book detail page", () => {
  test("shows custom 404 for a non-existent libro", async ({ page }) => {
    await page.goto("/libro/id-che-non-esiste-mai");
    await expect(page.getByText(/questo libro non/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /torna al catalogo/i })).toBeVisible();
  });

  test("lets any visitor share the book", async ({ page }) => {
    // Desktop senza Web Share: deve comparire il fallback con i link
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await page.goto("/");
    const firstBook = page.locator('a[href^="/libro/"]').first();
    const href = await firstBook.getAttribute("href");
    await page.goto(href!);

    await page.getByRole("button", { name: /condividi/i }).click();
    const telegram = page.getByRole("link", { name: /^telegram$/i });
    await expect(telegram).toHaveAttribute("href", new RegExp(`^https://t\\.me/share/url\\?url=.*${encodeURIComponent(href!)}`));
    await expect(page.getByRole("link", { name: /^whatsapp$/i })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  });
});

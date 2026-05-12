import { test, expect } from "@playwright/test";

test.describe("Catalog page", () => {
  test("loads and shows the header with logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: /libri in giro bcn/i }).first()).toBeVisible();
    await expect(page.getByRole("banner").getByAltText("Libri in Giro BCN")).toBeVisible();
  });

  test("has a link to add a book", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /aggiungi/i })).toBeVisible();
  });

  test("shows the hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /libri in italiano/i })).toBeVisible();
  });
});

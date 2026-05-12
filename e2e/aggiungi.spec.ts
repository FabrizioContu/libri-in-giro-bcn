import { test, expect } from "@playwright/test";

test.describe("Add book form", () => {
  test("renders all required fields", async ({ page }) => {
    await page.goto("/aggiungi");
    await expect(page.getByLabel(/titolo/i)).toBeVisible();
    await expect(page.getByLabel(/autore/i)).toBeVisible();
    await expect(page.getByText(/genere/i).first()).toBeVisible();
    await expect(page.getByText(/barrio/i).first()).toBeVisible();
  });

  test("shows cover search spinner after typing title and author", async ({ page }) => {
    await page.goto("/aggiungi");
    await page.getByLabel(/titolo/i).fill("Il nome della rosa");
    await page.getByLabel(/autore/i).fill("Umberto Eco");
    await expect(page.getByText(/cercando copertina/i)).toBeVisible({ timeout: 2000 });
  });

  test("shows validation error when submitting empty form", async ({ page }) => {
    await page.goto("/aggiungi");
    await page.getByRole("button", { name: /aggiungi al catalogo/i }).click();
    await expect(page.getByText(/titolo è obbligatorio/i)).toBeVisible();
  });
});

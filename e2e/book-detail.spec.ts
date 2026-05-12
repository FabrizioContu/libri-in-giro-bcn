import { test, expect } from "@playwright/test";

test.describe("Book detail page", () => {
  test("shows custom 404 for a non-existent libro", async ({ page }) => {
    await page.goto("/libro/id-che-non-esiste-mai");
    await expect(page.getByText(/questo libro non/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /torna al catalogo/i })).toBeVisible();
  });
});

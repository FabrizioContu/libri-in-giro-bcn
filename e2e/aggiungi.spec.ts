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

  // Il test dello spinner passava anche quando la CSP bloccava la ricerca:
  // qui si verifica che la copertina arrivi davvero, passando da /api/lookup.
  test("fills the cover found via the server-side lookup", async ({ page }) => {
    await page.route("**/api/lookup/cover?*", (route) =>
      route.fulfill({
        json: { copertina_url: "https://covers.openlibrary.org/b/id/1-M.jpg" },
      })
    );
    await page.goto("/aggiungi");
    await page.getByLabel(/titolo/i).fill("Il nome della rosa");
    await page.getByLabel(/autore/i).fill("Umberto Eco");
    await expect(page.getByText(/copertina trovata automaticamente/i)).toBeVisible({ timeout: 4000 });
  });

  test.describe("manual ISBN entry when the camera is unavailable", () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        navigator.mediaDevices.getUserMedia = () =>
          Promise.reject(new DOMException("blocked", "NotAllowedError"));
      });
      await page.route("**/api/lookup/isbn?*", (route) =>
        route.fulfill({
          json: { titolo: "Il nome della rosa", autore: "Umberto Eco", copertina_url: null },
        })
      );
      await page.goto("/aggiungi");
      await page.getByRole("button", { name: /scansiona isbn/i }).click();
      await expect(page.getByText(/fotocamera non disponibile/i)).toBeVisible();
      await page.getByPlaceholder(/ISBN-13/).fill("9788804668237");
    });

    // Un <form> annidato nello scanner faceva ricaricare la pagina al submit.
    test("fills title and author via the Cerca button without reloading", async ({ page }) => {
      await page.getByRole("button", { name: /^cerca$/i }).click();
      await expect(page.getByLabel(/titolo/i)).toHaveValue("Il nome della rosa");
      await expect(page.getByLabel(/autore/i)).toHaveValue("Umberto Eco");
    });

    test("Enter searches the ISBN instead of submitting the book form", async ({ page }) => {
      await page.getByPlaceholder(/ISBN-13/).press("Enter");
      await expect(page.getByLabel(/titolo/i)).toHaveValue("Il nome della rosa");
      await expect(page.getByText(/titolo è obbligatorio/i)).toHaveCount(0);
    });
  });

  test("prefills the contact used last time", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("lgbcn_contact_tab", "altro");
      localStorage.setItem("lgbcn_whatsapp", "34 612 345 678");
    });
    await page.goto("/aggiungi");
    await expect(page.getByRole("tab", { name: /whatsapp/i })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByPlaceholder("34 612 345 678")).toHaveValue("34 612 345 678");
  });

  test("warns about a cover URL from a host that cannot be displayed", async ({ page }) => {
    await page.goto("/aggiungi");
    await page.getByLabel(/url copertina/i).fill("https://upload.wikimedia.org/cover.jpg");
    await expect(page.getByText(/usa un link di copertina da open library/i)).toBeVisible();
  });

  test("allows camera access for the ISBN scanner", async ({ page }) => {
    const res = await page.goto("/aggiungi");
    expect(res?.headers()["permissions-policy"]).toContain("camera=(self)");
  });

  test("shows validation error when submitting empty form", async ({ page }) => {
    await page.goto("/aggiungi");
    await page.getByRole("button", { name: /aggiungi al catalogo/i }).click();
    await expect(page.getByText(/titolo è obbligatorio/i)).toBeVisible();
  });
});

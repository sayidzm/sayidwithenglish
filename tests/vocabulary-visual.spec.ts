import { expect, test } from "./fixtures";

test("Add and Library vocabulary states stay readable at desktop and mobile widths", async ({ page }, testInfo) => {
  test.skip(!["desktop", "mobile"].includes(testInfo.project.name));
  const capture = async (name: string, fullPage = false) => {
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage, animations: "disabled" });
  };
  await page.goto("/add");
  await expect(page.getByRole("heading", { name: "Ekle", exact: true })).toBeVisible();
  await capture("add-default");
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await expect(page.getByRole("button", { name: "Kütüphaneye kaydet" })).toBeVisible();
  await capture("add-processed");
  await capture("add-processed-full", true);
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Henüz kayıt yok" })).toBeVisible();
  await capture("library-empty");
  await page.goto("/add");
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("4 kayıt kütüphanene kaydedildi");
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Kütüphane", exact: true })).toBeVisible();
  await capture("library-populated");
  await page.getByRole("button", {
    name: testInfo.project.name === "mobile" ? /^figure out B1/ : "figure out",
    exact: testInfo.project.name !== "mobile",
  }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await capture("library-drawer");
});

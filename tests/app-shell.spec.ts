import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const routes = [
  ["dashboard", "Ana Sayfa"], ["add", "Ekle"], ["library", "Kütüphane"], ["learn", "Öğren"],
  ["review", "Tekrar"], ["tutor", "AI Tutor"], ["statistics", "İstatistikler"], ["settings", "Ayarlar"],
] as const;

async function capture(page: Page, name: string) {
  const directory = join(process.cwd(), "qa", "screenshots");
  await mkdir(directory, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(directory, `${name}.png`), fullPage: true, animations: "disabled" });
}

for (const [route, title] of routes) {
  test(`${route}: page, navigation and responsive layout`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`/${route}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: title, level: 1, exact: true })).toBeVisible();
    await expect(page).toHaveTitle(`${title} · sayidwithenglish`);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");

    const width = page.viewportSize()!.width;
    const sidebar = page.getByRole("complementary", { name: "Kenar çubuğu" });
    const mobileNav = page.getByRole("navigation", { name: "Mobil navigasyon" });
    if (width < 640) {
      await expect(sidebar).toBeHidden();
      await expect(mobileNav).toBeVisible();
      await expect(mobileNav.getByRole("link")).toHaveCount(5);
      for (const link of await mobileNav.getByRole("link").all()) {
        const bounds = await link.boundingBox();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
      }
    } else {
      await expect(sidebar).toBeVisible();
      await expect(mobileNav).toBeHidden();
      expect((await sidebar.boundingBox())!.width).toBe(width < 1024 ? 64 : 216);
      await expect(sidebar.getByRole("navigation").locator('[aria-current="page"]')).toHaveAttribute("href", `/${route}`);
    }
    expect((await page.getByRole("banner").boundingBox())!.height).toBe(56);
    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      h1Size: getComputedStyle(document.querySelector("h1")!).fontSize,
      background: getComputedStyle(document.body).backgroundColor,
    }));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.h1Size).toBe("26px");
    expect(layout.background).toBe("rgb(8, 12, 20)");
    await capture(page, `${info.project.name}-${route}`);
    expect(errors).toEqual([]);
  });
}

test("root redirects and skip link supports the keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "İçeriğe geç" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("command palette filters, closes, restores focus and navigates", async ({ page }, info) => {
  await page.goto("/dashboard");
  const trigger = page.getByRole("button", { name: "Arama ve hızlı erişimi aç" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Hızlı erişim" });
  const input = dialog.getByRole("textbox", { name: "Sayfa ara" });
  await expect(input).toBeFocused();
  await input.fill("eşleşmeyen sayfa");
  await expect(dialog.getByText("Eşleşen sayfa bulunamadı. Başka bir ad dene.")).toBeVisible();
  await input.fill("KÜTÜPHANE");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await capture(page, `${info.project.name}-palette`);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await input.fill("Kütüphane");
  await page.keyboard.press("ArrowDown");
  await expect(dialog.getByRole("link", { name: "Kütüphane" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/library$/);
  await expect(dialog).toBeHidden();
});

test("notifications and profile have usable destinations", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Bildirimleri aç" }).click();
  await expect(page.getByText("Henüz bildirimin yok.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Profil ve ayarlar", exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);
});

test("mobile menu exposes every route and bottom navigation works", async ({ page }, info) => {
  test.skip(page.viewportSize()!.width >= 640, "Mobile navigation only");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Tüm sayfaları aç" }).click();
  const menu = page.getByRole("menu", { name: "Tüm sayfalar" });
  await expect(menu.getByRole("menuitem")).toHaveCount(8);
  await capture(page, `${info.project.name}-menu`);
  await menu.getByRole("menuitem", { name: "Öğren", exact: true }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await page.getByRole("navigation", { name: "Mobil navigasyon" }).getByRole("link", { name: "Yeni kayıt ekle" }).click();
  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByRole("navigation", { name: "Mobil navigasyon" }).locator('[aria-current="page"]')).toHaveAttribute("href", "/add");
});

test("desktop sidebar collapse persists across navigation", async ({ page }, info) => {
  test.skip(page.viewportSize()!.width < 1024, "Desktop collapse only");
  await page.goto("/dashboard");
  const sidebar = page.getByRole("complementary", { name: "Kenar çubuğu" });
  await page.getByRole("button", { name: "Kenar çubuğunu daralt" }).click();
  expect((await sidebar.boundingBox())!.width).toBe(64);
  await capture(page, `${info.project.name}-collapsed`);
  await sidebar.getByRole("link", { name: "Kütüphane", exact: true }).click();
  await expect(page).toHaveURL(/\/library$/);
  expect((await sidebar.boundingBox())!.width).toBe(64);
  await page.getByRole("button", { name: "Kenar çubuğunu genişlet" }).click();
  expect((await sidebar.boundingBox())!.width).toBe(216);
});

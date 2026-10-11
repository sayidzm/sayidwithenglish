import { expect, type Page } from "@playwright/test";

/** Wait for streamed content and its styles, not just the initial document. */
export async function settlePage(page: Page) {
  await page.waitForLoadState("load");
  await expect(page.getByText("Oturum kontrol ediliyor…", { exact: true })).toBeHidden();
  await expect(page.getByText("Çalışma alanı yükleniyor…", { exact: true })).toBeHidden();
  await expect(page.locator("main h1")).toBeVisible();
  if (new URL(page.url()).pathname.startsWith("/settings")) {
    await expect(page.getByLabel("Adın", { exact: true })).toBeVisible();
  } else if (/^\/(login|register|forgot-password|reset-password)$/.test(new URL(page.url()).pathname)) {
    await expect(page.locator("main form")).toBeVisible();
  }
  await page.evaluate(() => document.fonts.ready);
  // Streaming can insert a stylesheet after a locator first becomes visible.
  let previous = "";
  let stable = 0;
  await expect.poll(async () => {
    const layout = await page.evaluate(() => {
      const heading = document.querySelector("main h1")!;
      const main = document.querySelector("main")!;
      const bounds = heading.getBoundingClientRect();
      return JSON.stringify({
        x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
        mainWidth: main.getBoundingClientRect().width,
        bodyWidth: document.documentElement.scrollWidth,
        font: getComputedStyle(heading).fontSize,
        background: getComputedStyle(document.body).backgroundColor,
      });
    });
    stable = layout === previous ? stable + 1 : 0;
    previous = layout;
    return stable;
  }, { intervals: [200], timeout: 10_000 }).toBeGreaterThanOrEqual(3);
}

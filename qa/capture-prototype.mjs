import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const round = process.argv[2] ?? "final";
const directory = join(process.cwd(), "qa", round);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const captures = [];
const routes = [
  "dashboard",
  "add",
  "library",
  "learn",
  "review",
  "tutor",
  "statistics",
  "settings",
];
for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function capture(state, fullPage = false) {
    await page.evaluate(() => document.fonts.ready);
    const path = join(directory, `${name}-${state}.png`);
    await page.screenshot({ path, animations: "disabled", fullPage });
    const metrics = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      contentHeight: document.documentElement.scrollHeight,
      images: document.querySelectorAll("img").length,
      mainTextLength: document.querySelector("main")?.textContent?.length ?? 0,
    }));
    captures.push({
      state: `${name}-${state}`,
      path,
      viewport,
      fullPage,
      metrics,
      errors: [...errors],
    });
    if (metrics.documentWidth > viewport.width || errors.length)
      throw new Error(
        `UI error: ${name}-${state} ${JSON.stringify({ metrics, errors })}`,
      );
  }
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:3100/${route}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await capture(route);
    if (
      [
        "dashboard",
        "add",
        "library",
        "learn",
        "statistics",
        "settings",
        "tutor",
      ].includes(route)
    )
      await capture(`${route}-full`, true);
    if (route === "library") {
      const button = page.getByRole("button", {
        name: name === "mobile" ? /^figure out B1/ : "figure out",
        exact: name !== "mobile",
      });
      await button.click();
      await page.getByRole("dialog").waitFor();
      await capture("library-drawer");
      await page
        .getByRole("heading", { name: "Kişisel not" })
        .scrollIntoViewIfNeeded();
      await capture("library-drawer-note");
      await page.getByRole("button", { name: "Detayı kapat" }).click();
    }
    if (route === "review") {
      await page.getByRole("button", { name: /Anlamı göster/ }).click();
      await capture("review-back");
    }
    if (route === "add") {
      await page.getByRole("button", { name: "AI ile İşle" }).click();
      await page.getByRole("button", { name: "Kütüphaneye kaydet" }).waitFor();
      await page.evaluate(() => window.scrollTo(0, 0));
      await capture("add-processed");
      await capture("add-processed-full", true);
    }
    if (route === "tutor") {
      await page.getByLabel("Mesajlar").evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await capture("tutor-correction");
    }
  }
  await page.close();
}
await browser.close();
await writeFile(
  join(directory, "manifest.json"),
  JSON.stringify({ capturedAt: new Date().toISOString(), captures }, null, 2),
);
console.log(
  `${captures.length} fresh viewport screenshots saved to ${directory}`,
);

import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

function firstEntry(page: Page) {
  return page.viewportSize()!.width < 640
    ? page.getByRole("button", { name: /^figure out B1/ })
    : page.getByRole("button", { name: "figure out", exact: true });
}
function entryButton(page: Page, expression: string) {
  const escaped = expression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return page.viewportSize()!.width < 640
    ? page.getByRole("button", { name: new RegExp(`^${escaped} (?:A1|A2|B1|B2|C1|C2)`) })
    : page.getByRole("button", { name: expression, exact: true });
}
async function navigate(page: Page, name: string) {
  await page.getByRole("button", { name: "Arama ve hızlı erişimi aç" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name, exact: true })
    .click();
}
async function seedExamples(page: Page) {
  await page.goto("/add");
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("4 kayıt kütüphanene kaydedildi");
  await page.goto("/library");
}

test("statistics uses a percentage scale and a single type distribution", async ({
  page,
}) => {
  await page.goto("/statistics");
  await expect(
    page.getByRole("heading", { name: "Kayıt Türleri", exact: true }),
  ).toHaveCount(1);
  const source = page.getByRole("meter", { name: "Diziler", exact: true });
  await expect(source).toHaveAttribute("aria-valuenow", "42");
  await expect(source).toHaveAttribute("aria-valuemax", "100");
  const track = await source.boundingBox();
  const fill = await source.locator(":scope > div").boundingBox();
  expect(fill!.width / track!.width).toBeCloseTo(0.42, 2);
});

test("library filters and drawer edit preserve keyboard focus", async ({
  page,
}) => {
  await seedExamples(page);
  await page.getByLabel("Kütüphanede ara").fill("awkward");
  await expect(page.getByText("1 kayıt", { exact: true })).toBeVisible();
  await page.getByLabel("Kütüphanede ara").fill("no matching expression");
  await expect(
    page.getByRole("heading", { name: "Bu filtrelere uyan kayıt yok" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Filtreleri temizle" }).click();
  await page.getByLabel("Tür filtresi").selectOption("Phrasal Verb");
  await expect(page.getByText("1 kayıt", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Temizle", exact: true }).click();
  const trigger = firstEntry(page);
  await trigger.click();
  const drawer = page.getByRole("dialog");
  await expect(
    drawer.getByRole("heading", { name: "figure out", exact: true }),
  ).toBeVisible();
  await expect(drawer).toContainText("anlamak");
  await expect(drawer).toContainText("Sonunda sorunu nasıl çözeceğimi buldum.");
  await expect(drawer).toContainText("Friends · S02 E05");
  await expect(drawer).toContainText("#günlük hayat");
  expect((await drawer.boundingBox())!.width).toBe(
    page.viewportSize()!.width < 640 ? page.viewportSize()!.width - 10 : 464,
  );
  await drawer.getByRole("button", { name: "Düzenle" }).click();
  await drawer
    .getByRole("textbox", { name: "Kişisel not", exact: true })
    .fill("Kendi örneğim: I figured it out.");
  await drawer.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(drawer.getByRole("status")).toContainText("Değişiklikler kaydedildi");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(
    drawer.getByText("Kendi örneğim: I figured it out.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await firstEntry(page).click();
  await expect(page.getByRole("dialog")).toContainText("Kendi örneğim: I figured it out.");
});

test("library card and list views contain the filtered collection", async ({
  page,
}) => {
  test.skip(
    page.viewportSize()!.width < 640,
    "Mobile has its dedicated card presentation",
  );
  await seedExamples(page);
  await page.getByRole("button", { name: "Kart görünümü" }).click();
  await expect(
    page.getByRole("button", { name: /^figure out B1/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Liste görünümü" }).click();
  await expect(
    page.getByRole("button", { name: /^figure out B1/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tablo görünümü" }).click();
  await expect(page.getByRole("table")).toBeVisible();
});

test("Add saves entries and Library persists them after refresh", async ({
  page,
}) => {
  await page.goto("/add");
  await expect(page.getByText("4 ifade algılandı")).toBeVisible();
  if (page.viewportSize()!.width < 640) {
    await expect(page.getByLabel("Kaynak türü")).toBeHidden();
    await page.getByText("Kaynak ve organizasyon", { exact: false }).click();
    await expect(page.getByLabel("Kaynak türü")).toBeVisible();
    await page.getByText("Kaynak ve organizasyon", { exact: false }).click();
  }
  if (page.viewportSize()!.width < 640)
    await page.getByText("Kaynak ve organizasyon", { exact: false }).click();
  await page.getByLabel("Deck", { exact: true }).fill("Kendi deckim");
  await page.getByLabel("Etiketler", { exact: true }).fill("yeni etiket");
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await expect(
    page.getByRole("button", { name: "İfadeler işleniyor..." }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("kütüphanene kaydedildi");
  await page.getByRole("link", { name: /Kütüphaneye git/ }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole("heading", { name: "Kütüphane", exact: true })).toBeVisible();
  await expect(page.getByText("4 kayıt", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("4 kayıt", { exact: true }).first()).toBeVisible();
  await firstEntry(page).click();
  await expect(page.getByRole("dialog")).toContainText("Kendi deckim");
  await expect(page.getByRole("dialog")).toContainText("#yeni etiket");
});

test("unknown input can be completed manually and saved without fabricated AI", async ({
  page,
}) => {
  await page.goto("/add");
  await page
    .getByRole("textbox", { name: "İngilizce ifadeler" })
    .fill("");
  await expect(page.getByText("0 ifade algılandı")).toBeVisible();
  await page.getByRole("textbox", { name: "İngilizce ifadeler" }).fill("uncanny turn of phrase");
  await expect(page.getByText("1 ifade algılandı")).toBeVisible();
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await expect(page.getByRole("status").filter({ hasText: "hazır örnek bulunamadı" })).toContainText(
    "elle tamamlayıp kaydedebilirsin",
  );
  await expect(page.getByText("Açıklamayı elle tamamlayabilirsin.")).toBeVisible();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("status").filter({ hasText: "kütüphanene kaydedildi" }))
    .toContainText("1 kayıt kütüphanene kaydedildi");
  await page.goto("/library");
  await expect(entryButton(page, "uncanny turn of phrase")).toBeVisible();
});

test("Add enforces its batch limit and saves edited lists with optional examples", async ({ page }) => {
  await page.goto("/add");
  const input = page.getByRole("textbox", { name: "İngilizce ifadeler" });
  await expect(async () => {
    await input.fill("");
    await expect(page.getByText("0 ifade algılandı")).toBeVisible();
  }).toPass();
  await input.fill(Array.from({ length: 21 }, (_, index) => `phrase ${index + 1}`).join("\n"));
  await expect(page.getByRole("alert").filter({ hasText: "en fazla 20 ifade" }))
    .toContainText("en fazla 20 ifade");
  await expect(page.getByRole("button", { name: "AI ile İşle" })).toBeDisabled();

  await input.fill("figure out");
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  const editor = page.locator("details").filter({ has: page.locator("summary", { hasText: "figure out" }) });
  await editor.locator("summary").click();
  await editor.getByRole("textbox", { name: "Türkçe anlamlar (her satıra bir anlam)" })
    .fill("anlamak\nçözmek\nyeni anlam");
  await editor.getByRole("textbox", { name: "Etiketler" }).fill("günlük hayat, yeni etiket");
  await editor.getByRole("button", { name: "Örnek ekle" }).click();
  await editor.getByRole("button", { name: "figure out örnek 3 kaldır" }).click();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("1 kayıt kütüphanene kaydedildi");
  await page.goto("/library");
  await firstEntry(page).click();
  await expect(page.getByRole("dialog")).toContainText("yeni anlam");
  await expect(page.getByRole("dialog")).toContainText("#yeni etiket");
});

test("duplicate opens existing entry and soft delete removes it after refresh", async ({ page }) => {
  await seedExamples(page);
  await page.goto("/add");
  await page.getByRole("textbox", { name: "İngilizce ifadeler" }).fill("");
  await expect(page.getByText("0 ifade algılandı")).toBeVisible();
  await page.getByRole("textbox", { name: "İngilizce ifadeler" }).fill("Figure Out");
  await expect(page.getByText("1 ifade algılandı")).toBeVisible();
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bu ifade zaten mevcut." })).toContainText("Bu ifade zaten mevcut.");
  await page.getByRole("link", { name: /Mevcut kaydı aç/ }).click();
  await expect(page).toHaveURL(/\/library\?entry=/);
  const drawer = page.getByRole("dialog");
  await expect(drawer).toContainText("figure out");
  await drawer.getByRole("button", { name: "Sil", exact: true }).click();
  await drawer.getByRole("button", { name: "Sil", exact: true }).click();
  await expect(drawer).toBeHidden();
  await page.reload();
  await expect(entryButton(page, "figure out")).toHaveCount(0);
  await expect(page.getByText("3 kayıt", { exact: true })).toBeVisible();
});

test("a second browser session sees the same account's saved vocabulary", async ({ browser }) => {
  const email = `${randomUUID()}@example.test`;
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  try {
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    for (const page of [pageA, pageB]) {
      await page.goto("/login");
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Şifre", { exact: true }).fill("Password123!");
      await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
    }
    await pageA.goto("/add");
    await pageA.getByRole("textbox", { name: "İngilizce ifadeler" }).fill("");
    await expect(pageA.getByText("0 ifade algılandı")).toBeVisible();
    await pageA.getByRole("textbox", { name: "İngilizce ifadeler" }).fill("awkward");
    await expect(pageA.getByText("1 ifade algılandı")).toBeVisible();
    await pageA.getByRole("button", { name: "AI ile İşle" }).click();
    await pageA.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
    await expect(pageA.getByRole("status")).toContainText("1 kayıt kütüphanene kaydedildi");
    await pageB.goto("/library");
    await expect(entryButton(pageB, "awkward")).toBeVisible();
  } finally {
    await contextA.close();
    await contextB.close();
  }
});

test("review reveal, ratings, focus mode and session progress work", async ({
  page,
}) => {
  await page.goto("/review");
  await expect(
    page.getByRole("progressbar", { name: "Tekrar ilerlemesi" }),
  ).toHaveAttribute("aria-valuenow", "12");
  await page.getByRole("button", { name: /Anlamı göster/ }).click();
  if (page.viewportSize()!.width < 640) {
    const repeat = await page.getByRole("button", { name: /^Tekrar 1$/ }).boundingBox();
    const hard = await page.getByRole("button", { name: /^Zor 2$/ }).boundingBox();
    const good = await page.getByRole("button", { name: /^İyi 3$/ }).boundingBox();
    expect(repeat!.x + repeat!.width).toBeLessThanOrEqual(hard!.x);
    expect(good!.y).toBeGreaterThan(repeat!.y);
  }
  await expect(
    page.getByRole("article", { name: "Flashcard arka yüz" }),
  ).toContainText("anlamak · çözmek · bir yolunu bulmak");
  await page.keyboard.press("3");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "13",
  );
  await page.getByRole("button", { name: "Odak modu", exact: true }).click();
  await expect(page.getByRole("banner")).toBeHidden();
  await page.getByRole("button", { name: "Odak modundan çık" }).click();
  await expect(page.getByRole("banner")).toBeVisible();
  await navigate(page, "Öğren");
  await expect(
    page.getByText("Bugünkü tekrarlarında 13 / 30 kartı tamamladın."),
  ).toBeVisible();
  await page.getByRole("link", { name: /Tekrara devam/ }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "13",
  );
});

test("Tutor prompts and composer append local conversation replies", async ({
  page,
}) => {
  await page.goto("/tutor");
  if (page.viewportSize()!.width === 390) {
    const composer = await page
      .getByRole("textbox", { name: "Tutor mesajı" })
      .boundingBox();
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(780);
  }
  await page
    .getByRole("button", { name: "Zorlandığım kalıpları öğret" })
    .click();
  await expect(page.getByRole("log")).toContainText(
    "üç farklı anlamda kullanılabilir",
  );
  await page
    .getByRole("textbox", { name: "Tutor mesajı" })
    .fill("I figured it out on my own.");
  await page.getByRole("button", { name: "Mesaj gönder" }).click();
  await expect(page.getByRole("log")).toContainText("Thanks for sharing!");
  await page.getByRole("button", { name: "Yeni konuşma" }).click();
  await expect(page.getByRole("log")).not.toContainText("Thanks for sharing!");
});

test("settings propagate to dashboard, learning context and review goal", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByLabel("Günlük tekrar hedefi").fill("50");
  await page.getByLabel("Mevcut seviye").selectOption("B2");
  await page
    .getByRole("button", { name: "Değişiklikleri kaydet", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("kaydedildi");
  await navigate(page, "Ana Sayfa");
  await expect(page.getByText("Günlük hedefin %48 tamamlandı")).toBeVisible();
  await expect(
    page.getByText("Hedefine sadece 26 tekrar kaldı.", { exact: false }),
  ).toBeVisible();
  await navigate(page, "Öğren");
  await expect(
    page.getByText("Günlük İngilizce · B2", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Bugünkü tekrarlarında 12 / 50 kartı tamamladın."),
  ).toBeVisible();
  await navigate(page, "Ayarlar");
  await page.getByLabel("Günlük tekrar hedefi").fill("10");
  await page
    .getByRole("button", { name: "Değişiklikleri kaydet", exact: true })
    .click();
  await navigate(page, "Tekrar");
  const progress = page.getByRole("progressbar", { name: "Tekrar ilerlemesi" });
  await expect(progress).toHaveAttribute("aria-valuemax", "10");
  await expect(progress).toHaveAttribute("aria-valuenow", "10");
});

test("learning quiz and translation evaluate the local example", async ({
  page,
}) => {
  await page.goto("/learn");
  await page
    .getByRole("heading", { name: "Quiz", exact: true })
    .locator("..")
    .getByRole("button", { name: "Başla" })
    .click();
  await page
    .getByRole("button", { name: "Anlamak, çözmek", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Doğru!");
  await page.getByRole("button", { name: "Modlara dön" }).click();
  await page
    .getByRole("heading", { name: "Translation", exact: true })
    .locator("..")
    .getByRole("button", { name: "Başla" })
    .click();
  await page
    .getByRole("textbox", { name: "Yanıtın" })
    .fill("This explanation makes sense.");
  await page.getByRole("button", { name: "Yanıtı kontrol et" }).click();
  await expect(page.getByRole("status")).toContainText("Doğru!");
});

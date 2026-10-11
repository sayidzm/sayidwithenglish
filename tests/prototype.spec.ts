import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

function firstEntry(page: Page) {
  return page.viewportSize()!.width < 640
    ? page.getByRole("button", { name: /^figure out B1/ })
    : page.getByRole("button", { name: "figure out", exact: true });
}
async function navigate(page: Page, name: string) {
  await page.getByRole("button", { name: "Arama ve hızlı erişimi aç" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name, exact: true })
    .click();
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
  await page.goto("/library");
  await page.getByLabel("Kütüphanede ara").fill("apparently");
  await expect(page.getByText("1 örnek kayıt", { exact: true })).toBeVisible();
  await page.getByLabel("Kütüphanede ara").fill("no matching expression");
  await expect(
    page.getByRole("heading", { name: "Bu filtrelere uyan kayıt yok" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Filtreleri temizle" }).click();
  await page.getByLabel("Tür filtresi").selectOption("Phrasal Verb");
  await expect(page.getByText("2 örnek kayıt", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Temizle", exact: true }).click();
  const trigger = firstEntry(page);
  await trigger.click();
  const drawer = page.getByRole("dialog");
  await expect(
    drawer.getByRole("heading", { name: "figure out", exact: true }),
  ).toBeVisible();
  expect((await drawer.boundingBox())!.width).toBe(
    page.viewportSize()!.width < 640 ? page.viewportSize()!.width - 10 : 464,
  );
  await drawer.getByRole("button", { name: "Düzenle" }).click();
  await drawer
    .getByRole("textbox", { name: "Kişisel not", exact: true })
    .fill("Kendi örneğim: I figured it out.");
  await drawer.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(
    drawer.getByText("Kendi örneğim: I figured it out.", { exact: true }),
  ).toBeVisible();
});

test("library card and list views contain the filtered collection", async ({
  page,
}) => {
  test.skip(
    page.viewportSize()!.width < 640,
    "Mobile has its dedicated card presentation",
  );
  await page.goto("/library");
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

test("mock Add processes supported entries and saves to the same session", async ({
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
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await expect(
    page.getByRole("button", { name: "İfadeler işleniyor..." }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Kütüphaneye kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("kütüphanene eklendi");
  await page.getByRole("link", { name: /Kütüphaneye git/ }).click();
  await expect(page.getByText("14 örnek kayıt")).toBeVisible();
  await expect(page.getByText("346 kayıt.", { exact: false })).toBeVisible();
});

test("unsupported mock input never fabricates processing results", async ({
  page,
}) => {
  await page.goto("/add");
  await page
    .getByRole("textbox", { name: "İngilizce ifadeler" })
    .fill("unknown expression");
  await page.getByRole("button", { name: "AI ile İşle" }).click();
  await expect(page.getByRole("status")).toContainText(
    "hazır örnek bulunamadı",
  );
  await expect(page.getByText("Örnek gerekli", { exact: true })).toBeVisible();
  await expect(page.getByText("0 kayıt", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "figure out", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Kütüphaneye kaydet" }),
  ).toHaveCount(0);
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

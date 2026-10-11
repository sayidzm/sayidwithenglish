import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { settlePage } from "./support/settle-page";

async function signIn(page: Page, email = `${randomUUID()}@example.test`) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Şifre", { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return email;
}
async function capture(page: Page, name: string) {
  await settlePage(page);
  await mkdir("qa/auth", { recursive: true });
  await page.screenshot({
    path: join("qa/auth", `${page.viewportSize()!.width}-${name}.png`),
    fullPage: true,
    animations: "disabled",
  });
}

test("all workspace routes reject anonymous and forged sessions", async ({
  page,
  context,
}) => {
  for (const route of [
    "dashboard",
    "add",
    "library",
    "learn",
    "review",
    "tutor",
    "statistics",
    "settings",
  ]) {
    await page.goto(`/${route}`);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=%2F${route}$`));
    await expect(
      page.getByRole("heading", { name: "Tekrar hoş geldin" }),
    ).toBeVisible();
  }
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value:
        "base64-" +
        Buffer.from(
          JSON.stringify({
            access_token: "forged",
            refresh_token: "forged",
            user: { id: "fake" },
          }),
        ).toString("base64url"),
      url: "http://127.0.0.1:3100",
    },
  ]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("login validates, preserves return route and persists across refresh", async ({
  page,
  context,
}) => {
  await page.goto("/login?next=/library");
  await capture(page, "login");
  await page.getByLabel("Email", { exact: true }).fill("unknown@example.test");
  await page.getByLabel("Şifre", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Email veya şifre hatalı",
  );
  await capture(page, "login-error");
  await page.getByLabel("Şifre", { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(
    page.getByRole("heading", { name: "Kütüphane", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Kütüphane", exact: true }),
  ).toBeVisible();
  const cookie = (await context.cookies()).find((value) =>
    value.name.endsWith("-auth-token"),
  )!;
  const session: Record<string, unknown> = JSON.parse(
    Buffer.from(cookie.value.slice(7), "base64url").toString(),
  );
  const before = session.refresh_token;
  session.expires_at = 1;
  await context.addCookies([
    {
      ...cookie,
      value:
        "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
    },
  ]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Kütüphane", exact: true }),
  ).toBeVisible();
  const after = (await context.cookies()).find((value) =>
    value.name.endsWith("-auth-token"),
  )!;
  expect(
    JSON.parse(Buffer.from(after.value.slice(7), "base64url").toString())
      .refresh_token,
  ).not.toBe(before);
});

test("register handles password validation and email confirmation success", async ({
  page,
}) => {
  await page.goto("/register");
  await capture(page, "register");
  await page.getByLabel("Adın", { exact: true }).fill("Sayid");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`${randomUUID()}@example.test`);
  await page.getByLabel("Yeni şifre", { exact: true }).fill("abcdefgh");
  await page.getByLabel("Şifreyi tekrar yaz", { exact: true }).fill("abcdefgh");
  await page
    .getByRole("button", { name: "Hesap oluştur", exact: true })
    .click();
  await expect(
    page.getByText("En az 8 karakter, bir harf ve bir rakam kullan."),
  ).toBeVisible();
  await page.getByLabel("Yeni şifre", { exact: true }).fill("Password123!");
  await page
    .getByLabel("Şifreyi tekrar yaz", { exact: true })
    .fill("Password123!");
  await page
    .getByRole("button", { name: "Hesap oluştur", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Email adresini doğrulamak",
  );
  await capture(page, "register-success");
});

test("forgot password uses the trusted callback and neutral success feedback", async ({
  page,
  request,
}) => {
  await page.goto("/forgot-password");
  await capture(page, "forgot-password");
  await page.getByLabel("Email", { exact: true }).fill("limited@example.test");
  await page
    .getByRole("button", { name: "Sıfırlama bağlantısı gönder", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Çok fazla deneme",
  );
  await page
    .getByLabel("Email", { exact: true })
    .fill("not-registered@example.test");
  await page
    .getByRole("button", { name: "Sıfırlama bağlantısı gönder", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("bir hesabın varsa");
  const response = await request.get("http://127.0.0.1:54329/test/redirect");
  expect((await response.json()).redirect).toBe(
    "http://127.0.0.1:3100/auth/callback?next=/reset-password",
  );
  await page.goto(
    `/auth/callback?code=fixture-valid-code-${randomUUID()}&next=/reset-password`,
  );
  await expect(page).toHaveURL(/\/reset-password$/);
  await expect(
    page.getByRole("button", { name: "Şifreyi güncelle", exact: true }),
  ).toBeEnabled();
});

test("reset requires a verified session, rejects replay and changes the password", async ({
  page,
}) => {
  await page.goto("/reset-password");
  await capture(page, "reset-invalid");
  await expect(
    page.getByRole("button", { name: "Şifreyi güncelle", exact: true }),
  ).toBeDisabled();
  await page.goto("/auth/callback?token_hash=bad&type=recovery");
  await expect(page).toHaveURL(/\/login\?error=invalid-link$/);
  const hash = `fixture-valid-hash-${randomUUID()}`;
  await page.goto(`/auth/callback?token_hash=${hash}&type=recovery`);
  await expect(page).toHaveURL(/\/reset-password$/);
  await capture(page, "reset-password");
  await page.getByLabel("Yeni şifre", { exact: true }).fill("Updated123!");
  await page
    .getByLabel("Şifreyi tekrar yaz", { exact: true })
    .fill("Different123!");
  await page
    .getByRole("button", { name: "Şifreyi güncelle", exact: true })
    .click();
  await expect(page.getByText("Şifreler eşleşmiyor.")).toBeVisible();
  await page.getByLabel("Yeni şifre", { exact: true }).fill("Updated123!");
  await page
    .getByLabel("Şifreyi tekrar yaz", { exact: true })
    .fill("Updated123!");
  await page
    .getByRole("button", { name: "Şifreyi güncelle", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login\?message=password-updated$/);
  await expect(page.getByRole("status")).toContainText("Şifren güncellendi");
  await page.goto(`/auth/callback?token_hash=${hash}&type=recovery`);
  await expect(page).toHaveURL(/\/login\?error=invalid-link$/);
  await page.getByLabel("Email", { exact: true }).fill(`${hash}@example.test`);
  await page.getByLabel("Şifre", { exact: true }).fill("Updated123!");
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("profile updates persist and logout blocks cached navigation", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/settings");
  await page.getByLabel("Adın", { exact: true }).fill("Sayid Test");
  await page.getByLabel("Günlük tekrar hedefi").fill("40");
  await page
    .getByRole("button", { name: "Değişiklikleri kaydet", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("kaydedildi");
  await page.reload();
  await expect(page.getByLabel("Adın", { exact: true })).toHaveValue(
    "Sayid Test",
  );
  await expect(page.getByLabel("Günlük tekrar hedefi")).toHaveValue("40");
  await capture(page, "settings-profile");
  await page.getByRole("button", { name: "Çıkış yap", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?message=signed-out$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("callback and login never accept external redirect destinations", async ({
  page,
}) => {
  await page.goto(
    `/auth/callback?token_hash=fixture-valid-hash-${randomUUID()}&type=signup&next=https://evil.example`,
  );
  await expect(page).toHaveURL(/127\.0\.0\.1:3100\/dashboard$/);
});

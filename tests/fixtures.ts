import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

export { expect };
export const test = base.extend({
  page: async ({ page }, run) => {
    await page.goto("/login");
    await page
      .getByLabel("Email", { exact: true })
      .fill(`${randomUUID()}@example.test`);
    await page.getByLabel("Şifre", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await run(page);
  },
});

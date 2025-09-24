import { test } from "@playwright/test";

const USER = "test@test.com";
const PASSWORD = "123";

test("login and save storage state", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("textbox", { name: "Email" }).fill(USER);
  await page.getByRole("textbox", { name: "Contraseña" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await page.waitForURL("http://localhost:5173/dashboard");

  await page.context().storageState({ path: "tests/auth.json" });
});


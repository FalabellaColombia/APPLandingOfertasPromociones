import { expect, test } from "@playwright/test";

// Generate unique names to avoid conflicts between simultaneous runs
const DATE = Date.now();
const PRODUCT_NAME = "ProductTestFlow";
const PRODUCT_EDITED_NAME = `ProductTestFlow_${DATE}`;
const REALTIME_TIMEOUT = 10000; // Timeout for waiting Realtime sync

test("COMPLETE CRUD: add, edit, hide, unhide, change orderSellout and delete a product", async ({ page }) => {
  // Go to dashboard
  await page.goto("/dashboard");

  // ---------------------------------------------------------------------------
  // CREATE - Create a new product
  // ---------------------------------------------------------------------------
  await page.getByRole("button", { name: "Agregar Producto" }).click();

  // Fill the form
  await page.locator('button[role="combobox"]', { hasText: "Selecciona categorías..." }).click();
  await page.getByRole("option", { name: "Tecnología" }).click();
  await page.getByRole("option", { name: "Hogar" }).click();
  await page.keyboard.press("Escape");
 
  await page.getByRole("textbox", { name: "Llamado" }).fill(PRODUCT_NAME);
  await page.getByRole("textbox", { name: "URL", exact: true }).fill("https://www.falabella.com.co/falabella-co");
  await page
    .getByRole("textbox", { name: "URL Imagen", exact: true })
    .fill("https://www.falabella.com.co/falabella-co");

  // Set dates via keyboard for control
  await page.locator('[data-testid="startDate"]').click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("381994");

  await page.locator('[data-testid="endDate"]').click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("481994");

  await page.getByLabel("Estado Oferta").selectOption("Lanzamiento");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();

  // Verify product creation via Realtime
  await page.getByRole("cell", { name: "Orden Sellout" }).locator("div").click();
  const products = page.locator('[data-testid="product-item"]').filter({
    has: page.getByText(PRODUCT_NAME, { exact: true })
  });
  await expect(products).toHaveCount(1, { timeout: REALTIME_TIMEOUT });
  await expect(products.first()).toBeVisible();

  // ---------------------------------------------------------------------------
  // UPDATE - Edit the newly created product
  // ---------------------------------------------------------------------------
  const productRow = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_NAME });
  await expect(productRow).toBeVisible();

  // Open menu and edit
  await productRow.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();

  const input = page.getByRole("textbox", { name: "Llamado" });
  await expect(input).toHaveValue(PRODUCT_NAME);
  await input.fill(PRODUCT_EDITED_NAME);
  await page.getByRole("button", { name: "Editar" }).click();

  // Verify update in Realtime
  const editedProductRow = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(editedProductRow).toHaveCount(1, { timeout: REALTIME_TIMEOUT });
  await expect(editedProductRow).toBeVisible();

  // Ensure previous name no longer exists
  const oldNameProducts = page.locator('[data-testid="product-item"]').filter({
    has: page.getByText(PRODUCT_NAME, { exact: true })
  });
  await expect(oldNameProducts).toHaveCount(0);

  // ---------------------------------------------------------------------------
  // HIDE - Hide product
  // ---------------------------------------------------------------------------
  await editedProductRow.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Ocultar" }).click();

  // Confirm it disappears from visible view
  await expect(page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME })).toHaveCount(0, {
    timeout: REALTIME_TIMEOUT
  });

  // Switch to hidden products view
  const hiddenProductsView = page.getByRole("button", { name: "Productos Ocultos" });
  await hiddenProductsView.click();
  await expect(hiddenProductsView).not.toHaveClass(/text-muted-foreground/);

  // Verify it appears in hidden products
  const hiddenProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(hiddenProduct).toHaveCount(1, { timeout: REALTIME_TIMEOUT });
  await expect(hiddenProduct).toBeVisible();

  // ---------------------------------------------------------------------------
  // UNHIDE - Unhide product
  // ---------------------------------------------------------------------------
  await hiddenProduct.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Desocultar" }).click();

  // Verify removal from hidden list
  await expect(hiddenProduct).toHaveCount(0, { timeout: REALTIME_TIMEOUT });

  // Switch to visible products view
  const visibleProductsView = page.getByRole("button", { name: "Productos Visibles" });
  await visibleProductsView.click();
  await expect(visibleProductsView).not.toHaveClass(/text-muted-foreground/);

  // Confirm it reappears in main view
  const unhidedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(unhidedProduct).toBeVisible({ timeout: REALTIME_TIMEOUT });

  // ---------------------------------------------------------------------------
  // CHANGE ORDERSELLOUT - Change product priority
  // ---------------------------------------------------------------------------
  // Search the product using the search input
  await page.locator('input[placeholder="Buscar llamado..."]').fill(PRODUCT_EDITED_NAME);

  // Wait for the product to appear in the filtered results
  const productToMove = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(productToMove).toBeVisible({ timeout: REALTIME_TIMEOUT });

  // Open edit menu
  await productToMove.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Mover" }).click();

  // Modify sellout order
  await page.getByRole("spinbutton", { name: "Nuevo Orden Sellout" }).fill("20");
  await page.getByRole("button", { name: "Enviar" }).click();

  // Validate order change
  const movedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  const orderCell = movedProduct.locator("td").first();
  await expect(orderCell).toHaveText("20", { timeout: REALTIME_TIMEOUT });

  // ---------------------------------------------------------------------------
  // DELETE - Permanently delete product
  // ---------------------------------------------------------------------------
  await movedProduct.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar" }).click();

  // Verify Realtime removes the product
  const deletedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(deletedProduct).toHaveCount(0, { timeout: REALTIME_TIMEOUT });
});

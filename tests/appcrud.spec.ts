import { expect, test } from "@playwright/test";

// Generar nombres únicos para evitar conflictos entre ejecuciones simultáneas
const DATE = Date.now();
const PRODUCT_NAME = "ProductTestFlow";
const PRODUCT_EDITED_NAME = `ProductTestFlow_${DATE}`;
const REALTIME_TIMEOUT = 10000; // Timeout para esperar sincronización Realtime

test("COMPLETE CRUD: add, edit, hide, unhide, change orderSellout and delete a product", async ({ page }) => {
  // Ir al dashboard
  await page.goto("/dashboard");

  // ============================================================================
  // CREATE - Crear un nuevo producto
  // ============================================================================

  await page.getByRole("button", { name: "Agregar Producto" }).click();

  // Completar formulario
  await page.getByLabel("Categoría").selectOption("Otros");
  await page.getByRole("textbox", { name: "Llamado" }).fill(PRODUCT_NAME);
  await page.getByRole("textbox", { name: "URL", exact: true }).fill("https://www.falabella.com.co/falabella-co");
  await page
    .getByRole("textbox", { name: "URL Imagen", exact: true })
    .fill("https://www.falabella.com.co/falabella-co");

  // Configurar fechas mediante teclado (para mayor control)
  await page.locator('[data-testid="start-date"]').click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("381994");

  await page.locator('[data-testid="end-date"]').click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("481994");

  await page.getByLabel("Estado Oferta").selectOption("Lanzamiento");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();

  // Verificar creación del producto mediante Realtime
  await page.getByRole("cell", { name: "Orden Sellout" }).locator("div").click();
  const products = page.locator('[data-testid="product-item"]').filter({
    has: page.getByText(PRODUCT_NAME, { exact: true })
  });
  await expect(products).toHaveCount(1, { timeout: REALTIME_TIMEOUT });
  await expect(products.first()).toBeVisible();

  // ============================================================================
  // UPDATE - Editar el producto recién creado
  // ============================================================================

  const productRow = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_NAME });
  await expect(productRow).toBeVisible();

  // Abrir menú y editar
  await productRow.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();

  const input = page.getByRole("textbox", { name: "Llamado" });
  await expect(input).toHaveValue(PRODUCT_NAME);
  await input.fill(PRODUCT_EDITED_NAME);
  await page.getByRole("button", { name: "Editar" }).click();

  // Verificar actualización en tiempo real
  const editedProductRow = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(editedProductRow).toHaveCount(1, { timeout: REALTIME_TIMEOUT });
  await expect(editedProductRow).toBeVisible();

  // Asegurar que el nombre anterior ya no existe
  const oldNameProducts = page.locator('[data-testid="product-item"]').filter({
    has: page.getByText(PRODUCT_NAME, { exact: true })
  });
  await expect(oldNameProducts).toHaveCount(0);

  // ============================================================================
  // HIDE - Ocultar producto
  // ============================================================================

  await editedProductRow.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Ocultar" }).click();

  // Confirmar que desaparece de la vista de visibles
  await expect(page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME })).toHaveCount(0, {
    timeout: REALTIME_TIMEOUT
  });

  // Cambiar a vista de productos ocultos
  const hiddenProductsView = page.getByRole("button", { name: "Productos Ocultos" });
  await hiddenProductsView.click();
  await expect(hiddenProductsView).not.toHaveClass(/text-muted-foreground/);

  // Verificar que aparece en productos ocultos
  const hiddenProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(hiddenProduct).toHaveCount(1, { timeout: REALTIME_TIMEOUT });
  await expect(hiddenProduct).toBeVisible();

  // ============================================================================
  // UNHIDE - Desocultar producto
  // ============================================================================

  await hiddenProduct.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Desocultar" }).click();

  // Verificar que se elimina de la lista de ocultos
  await expect(hiddenProduct).toHaveCount(0, { timeout: REALTIME_TIMEOUT });

  // Cambiar a vista de productos visibles
  const visibleProductsView = page.getByRole("button", { name: "Productos Visibles" });
  await visibleProductsView.click();
  await expect(visibleProductsView).not.toHaveClass(/text-muted-foreground/);

  // Confirmar que reaparece en la vista principal
  const unhidedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(unhidedProduct).toBeVisible({ timeout: REALTIME_TIMEOUT });

  // ============================================================================
  // CHANGE ORDERSELLOUT - Cambiar orden de prioridad
  // ============================================================================

  const productToMove = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(productToMove).toBeVisible({ timeout: REALTIME_TIMEOUT });

  await productToMove.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Mover" }).click();

  // Modificar orden sellout
  await page.getByRole("spinbutton", { name: "Nuevo Orden Sellout" }).fill("20");
  await page.getByRole("button", { name: "Enviar" }).click();

  // Validar cambio de orden
  const movedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  const orderCell = movedProduct.locator("td").first();
  await expect(orderCell).toHaveText("20", { timeout: REALTIME_TIMEOUT });

  // ============================================================================
  // DELETE - Eliminar producto permanentemente
  // ============================================================================

  await movedProduct.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar" }).click();

  // Verificar que Realtime elimina el producto
  const deletedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(deletedProduct).toHaveCount(0, { timeout: REALTIME_TIMEOUT });
});

import { expect, test } from "@playwright/test";

// Generar nombres únicos para evitar conflictos entre ejecuciones
const DATE = Date.now();
const PRODUCT_NAME = "ProductTestFlow";
const PRODUCT_EDITED_NAME = `ProductTestFlow_${DATE}`;

test("COMPLETE CRUD: add, edit, hide, unhide, change orderSellout and delete a product", async ({ page }) => {
  // Navegar al dashboard de la aplicación
  await page.goto("/dashboard");

  // ============================================================================
  // CREATE - Crear un nuevo producto con todos los campos requeridos
  // ============================================================================

  await page.getByRole("button", { name: "Agregar Producto" }).click();

  // Llenar formulario de creación
  await page.getByLabel("Categoría").selectOption("Otros");
  await page.getByRole("textbox", { name: "Llamado" }).fill(PRODUCT_NAME);
  await page.getByRole("textbox", { name: "URL", exact: true }).fill("https://www.falabella.com.co/falabella-co");
  await page
    .getByRole("textbox", { name: "URL Imagen", exact: true })
    .fill("https://www.falabella.com.co/falabella-co");

  // Configurar fecha de inicio (navegación con teclado para precisión)
  await page.locator('[data-testid="start-date"]').click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("381994");

  // Configurar fecha de fin
  await page.locator('[data-testid="end-date"]').click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("481994");

  await page.getByLabel("Estado Oferta").selectOption("Lanzamiento");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();

  // ============================================================================
  // READ - Verificar que el producto se creó correctamente y sin duplicados
  // ============================================================================

  // Ordenar por "Orden Sellout" para tener vista consistente
  await page.getByRole("cell", { name: "Orden Sellout" }).locator("div").click();

  // Verificar que existe exactamente UN producto con el nombre creado
  const products = page.locator('[data-testid="product-item"]').filter({
    has: page.getByText(PRODUCT_NAME, { exact: true })
  });
  await expect(products).toHaveCount(1);
  await expect(products.first()).toBeVisible();

  // ============================================================================
  // UPDATE - Editar el producto recién creado
  // ============================================================================

  const productRow = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_NAME });
  await expect(productRow).toBeVisible();

  // Abrir menú de edición y seleccionar "Editar"
  await productRow.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();

  // Verificar que el formulario tiene el valor actual y cambiarlo
  const input = page.getByRole("textbox", { name: "Llamado" });
  await expect(input).toHaveValue(PRODUCT_NAME);
  await input.fill(PRODUCT_EDITED_NAME);
  await page.getByRole("button", { name: "Editar" }).click();

  // Verificar que la edición fue exitosa y sin duplicados
  const editedProductRow = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(editedProductRow).toHaveCount(1);
  await expect(editedProductRow).toBeVisible();

  // Verificar que el nombre anterior ya no existe (no quedó duplicado)
  const oldNameProducts = page.locator('[data-testid="product-item"]').filter({
    has: page.getByText(PRODUCT_NAME, { exact: true })
  });
  await expect(oldNameProducts).toHaveCount(0);

  // ============================================================================
  // HIDE - Ocultar producto de la vista principal
  // ============================================================================

  await editedProductRow.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Ocultar" }).click();

  // Verificar que se ocultó completamente de la vista principal
  await expect(page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME })).toHaveCount(0);

  // Cambiar a vista "Productos Ocultos" para continuar el flujo
  const hiddenProductsView = page.getByRole("button", { name: "Productos Ocultos" });
  await hiddenProductsView.click();
  await expect(hiddenProductsView).not.toHaveClass(/text-muted-foreground/);

  // Verificar que aparece exactamente una vez en productos ocultos
  const hiddenProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(hiddenProduct).toHaveCount(1);
  await expect(hiddenProduct).toBeVisible();

  // ============================================================================
  // UNHIDE - Mostrar producto nuevamente (moverlo de ocultos a visibles)
  // ============================================================================

  await hiddenProduct.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Desocultar" }).click();

  // Verificar que el producto está visible después de desocultar
  const unhidedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(unhidedProduct).toHaveCount(1);
  await expect(unhidedProduct).toBeVisible();

  // Cambiar a vista "Productos Visibles"
  await page.getByRole("button", { name: "Productos Visibles" }).click();

  // ============================================================================
  // CHANGE ORDERSELLOUT - Cambiar el orden sellout del producto
  // ============================================================================

  const productToMove = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await productToMove.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Mover" }).click();

  // Cambiar orden sellout a 20
  await page.getByRole("spinbutton", { name: "Nuevo Orden Sellout" }).fill("20");
  await page.getByRole("button", { name: "Enviar" }).click();

  // Verificar que el cambio de orden fue exitoso
  const movedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  const orderCell = movedProduct.locator("td").first();
  await expect(orderCell).toHaveText("20");

  // ============================================================================
  // DELETE - Eliminar producto permanentemente
  // ============================================================================

  await movedProduct.getByRole("button", { name: "Open edit menu" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();

  // Confirmar eliminación en el diálogo modal
  await page.getByRole("button", { name: "Eliminar" }).click();

  // Verificar eliminación completa usando locator fresco
  const deletedProduct = page.locator('[data-testid="product-item"]', { hasText: PRODUCT_EDITED_NAME });
  await expect(deletedProduct).toHaveCount(0);
});

import {
  addProduct,
  deleteProduct,
  editProduct,
  getMaxOrderSellout,
  hideProduct,
  unhideProduct,
  upsertProducts
} from "@/api/products";
import Sonner from "@/components/Sonner";
import { VIEW_LISTADO } from "@/constants/views";
import type { Product, ProductForm, ProductToMove } from "@/types/product";
import { isPostgresError } from "@/utils/errorHelpers";
import {
  getChangedFields,
  getDefaultEditProductForm,
  getDefaultResetForm,
  getOrderSelloutForUI,
  getVisibleProducts,
  moveProductToEnd,
  reorderOrderSellout,
  updateVisibleOrderInAllProducts
} from "@/utils/product.utils";
import { parseDate } from "@internationalized/date";
import { useState } from "react";

type UseProductActionsParams = {
  reset: (values?: ProductForm) => void;
};

export function useProductActions({ reset }: UseProductActionsParams) {
  const [isloadingButton, setIsloadingButton] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [idProductToEdit, setIdProductToEdit] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formEditingIsOpen, setFormEditingIsOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string>(VIEW_LISTADO);
  const [isFormOrderSelloutOpen, setIsFormOrderSelloutOpen] = useState(false);
  const [productToMove, setProductToMove] = useState<ProductToMove>({
    id: "",
    orderSellout: 0,
    title: ""
  });
  const [originalProductData, setOriginalProductData] = useState<Product | null>(null);

  const handleAddProduct = async (formData: Product) => {
    setIsloadingButton(true);
    try {
      const maxOrderSellout = await getMaxOrderSellout();
      const dataToSend = { ...formData, orderSellout: maxOrderSellout };

      const addedProduct = await addProduct(dataToSend);
      setAllProducts((prev) => [...prev, addedProduct]);
      setProducts((prev) => [...prev, addedProduct]);
      setIsModalOpen(false);
      setOpenDrawer(false);

      Sonner({
        message: "Producto agregado correctamente",
        sonnerState: "success"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (isPostgresError(error) && error.code === "23505") {
          Sonner({
            message: "Este orden sellout ya existe en la lista",
            sonnerState: "error"
          });
        }
      } else {
        console.error("Error desconocido", error);
      }
    } finally {
      setIsloadingButton(false);
    }
  };

  const handlePrepareEditForm = (product: Product) => {
    setFormEditingIsOpen(true);
    setIdProductToEdit(product.id || null);

    setOriginalProductData(product);

    if (!product.id) return;

    const formData: ProductForm = {
      ...product,
      orderSellout: getOrderSelloutForUI(products, product.id),
      startDate: parseDate(product.startDate),
      endDate: parseDate(product.endDate)
    };

    reset(getDefaultEditProductForm(formData));
    setOpenDrawer(true);
  };

  const handleEditProduct = async (formData: Product) => {
    if (!idProductToEdit || !originalProductData) {
      Sonner({
        message: "No hay producto seleccionado para editar",
        sonnerState: "error"
      });
      return;
    }

    setIsloadingButton(true);

    try {
      const changedFields = getChangedFields(originalProductData, formData);

      if (Object.keys(changedFields).length === 0) {
        Sonner({
          message: "No se detectaron cambios",
          sonnerState: "warning"
        });
        setIsloadingButton(false);
        return;
      }

      const productUpdated = await editProduct(changedFields, idProductToEdit);

      if (productUpdated) {
        Sonner({
          message: "Producto actualizado correctamente",
          sonnerState: "success"
        });

        setProducts((prev) => prev.map((p) => (p.id === idProductToEdit ? productUpdated[0] : p)));
        setAllProducts((prev) => prev.map((p) => (p.id === idProductToEdit ? productUpdated[0] : p)));

        setFormEditingIsOpen(false);
        setOpenDrawer(false);
        reset(getDefaultResetForm());
        setIdProductToEdit(null);
        setOriginalProductData(null);
      }
    } catch (error) {
      Sonner({
        message: "Ocurrió un error al editar el producto",
        sonnerState: "error"
      });
      console.error(error);
    } finally {
      setIsloadingButton(false);
    }
  };

  const handleDeleteProduct = async (productInfo: Product) => {
    const id = productInfo.id;
    if (!id) {
      Sonner({ message: "ID inválido", sonnerState: "error" });
      return;
    }

    try {
      await deleteProduct(id);
      const updateList = allProducts.filter((p) => p.id !== id);
      setAllProducts(updateList);

      if (activeButton === VIEW_LISTADO) {
        const visibleProducts = getVisibleProducts(updateList);
        const orderedProducts = reorderOrderSellout(visibleProducts);
        const fullyUpdatedList = updateVisibleOrderInAllProducts(updateList, orderedProducts);
        setAllProducts(fullyUpdatedList);
        await upsertProducts(orderedProducts);
        setProducts(orderedProducts);
      } else {
        const hiddenProducts = updateList.filter((p) => p.isProductHidden);
        setProducts(hiddenProducts);
      }
      Sonner({
        message: "Producto eliminado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al eliminar el producto",
        sonnerState: "error"
      });
    }
  };

  const handleHideProduct = async (product: Product) => {
    const id = product.id;
    if (!id) {
      Sonner({
        message: "No hay producto seleccionado para ocultar",
        sonnerState: "error"
      });
      return;
    }

    try {
      const hiddenProduct = await hideProduct(id);
      const updatedList = allProducts.map((p) => (p.id === id ? hiddenProduct : p));
      const visibleProducts = getVisibleProducts(updatedList);
      const orderedProducts = reorderOrderSellout(visibleProducts);
      const fullyUpdatedList = updateVisibleOrderInAllProducts(updatedList, orderedProducts);
      await upsertProducts(orderedProducts);
      setAllProducts(fullyUpdatedList);
      setProducts(orderedProducts);

      Sonner({
        message: "Producto ocultado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al ocultar el producto",
        sonnerState: "error"
      });
    }
  };

  const handleUnhideProduct = async (product: Product) => {
    const { id } = product;
    if (!id) {
      Sonner({
        message: "No hay producto seleccionado para desocultar",
        sonnerState: "error"
      });
      return;
    }

    try {
      const maxOrderSellout = await getMaxOrderSellout();
      const unhiddenProduct = await unhideProduct(+maxOrderSellout, id);
      const updatedList = moveProductToEnd(allProducts, id, unhiddenProduct);
      const visibles = getVisibleProducts(updatedList);

      setAllProducts(updatedList);
      setProducts(visibles);
      setActiveButton(VIEW_LISTADO);

      Sonner({
        message: "Producto desocultado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al desocultar el producto",
        sonnerState: "error"
      });
    }
  };

  const handlePrepareChangeOrderSelloutForm = (productInfo: ProductToMove) => {
    const productId = productInfo.id;
    if (!productId) return;

    const OrderSelloutForUI = getOrderSelloutForUI(products, productId);

    setOpenDrawer(true);
    setIsFormOrderSelloutOpen(true);
    setProductToMove({
      id: productId,
      orderSellout: OrderSelloutForUI,
      title: productInfo.title
    });
  };

  return {
    // General State
    isloadingButton,
    isModalOpen,
    setIsModalOpen,
    openDrawer,
    setOpenDrawer,
    activeButton,
    setActiveButton,

    // Products
    allProducts,
    setAllProducts,
    products,
    setProducts,
    productToMove,

    // Edition
    formEditingIsOpen,
    setFormEditingIsOpen,
    isFormOrderSelloutOpen,
    setIsFormOrderSelloutOpen,

    // Actions
    handleAddProduct,
    handleEditProduct,
    handlePrepareEditForm,
    handleDeleteProduct,
    handleHideProduct,
    handleUnhideProduct,
    handlePrepareChangeOrderSelloutForm
  };
}

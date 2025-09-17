import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import { productToMoveFormSchema } from "@/lib/schemas/product.schema";
import type { ProductToMoveForm } from "@/types/product";
import {
  handleMassOrderChange,
  handleSingleOrderChange,
  needsRebalancing,
  validateOrderSelloutInput
} from "@/utils/product.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader } from "./Loader";
import Sonner from "./Sonner";

export default function FormMoveProduct() {
  const {
    isFormButtonLoading,
    productToMove,
    displayedProducts,
    setDisplayedProducts,
    setAllProducts,
    setIsFormOrderSelloutOpen,
    setIsDrawerOpen,
    setFormIsDirty
  } = useProducts();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<ProductToMoveForm>({
    resolver: zodResolver(productToMoveFormSchema),
    mode: "onChange"
  });

  useEffect(() => {
    setFormIsDirty(isDirty);
  }, [isDirty]);

  const onSubmitChangeOrderSellout = async (formData: ProductToMoveForm) => {
    const currentOrderSellout = displayedProducts.findIndex((p) => p.id === productToMove.id) + 1;
    const newOrderSellout = formData.neworderSellout;

    const validationError = validateOrderSelloutInput(newOrderSellout, currentOrderSellout, displayedProducts.length);
    if (validationError) {
      Sonner({
        message: validationError,
        sonnerState: "error"
      });
      return;
    }

    if (!productToMove.id) {
      Sonner({
        message: "El producto debe tener un ID para poder moverlo",
        sonnerState: "error"
      });
      return;
    }

    try {
      if (needsRebalancing(displayedProducts)) {
        await handleMassOrderChange(newOrderSellout, productToMove, setDisplayedProducts, setAllProducts);
      } else {
        await handleSingleOrderChange(
          productToMove.id,
          displayedProducts,
          formData,
          setDisplayedProducts,
          setAllProducts
        );
      }

      Sonner({
        message: "Orden actualizado correctamente",
        sonnerState: "success"
      });
      setIsFormOrderSelloutOpen(false);
      setIsDrawerOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Hubo un error al cambiar el orden sellout. Intenta más tarde.";

      Sonner({
        message: errorMessage,
        sonnerState: "error"
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmitChangeOrderSellout)}>
      <h3 className="mb-5 font-bold border-b-1 pb-3">Cambiar Orden Sellout</h3>
      <p className="text-xs text-muted-foreground">
        {productToMove.orderSellout} - {productToMove.title}
      </p>
      <div className="*:not-first:mt-1 mb-3 w-full">
        <Label className="text-sm font-medium" htmlFor="neworderSellout">
          Nuevo Orden Sellout
        </Label>
        <Input
          type="number"
          className="peer w-full"
          id="neworderSellout"
          placeholder="Ingresa el nuevo orden sellout"
          aria-invalid={!!errors.neworderSellout}
          {...register("neworderSellout", { valueAsNumber: true })}
        />
        {errors.neworderSellout && (
          <p className="peer-aria-invalid:text-destructive mt-2 text-xs" role="alert" aria-live="polite">
            {errors.neworderSellout.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isFormButtonLoading}>
        {isFormButtonLoading ? <Loader /> : "Enviar"}
      </Button>
    </form>
  );
}

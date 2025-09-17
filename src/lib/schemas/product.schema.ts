import type { CalendarDate } from "@internationalized/date";
import { z } from "zod";

export const productFormSchema = z
  .object({
    orderSellout: z.number(),
    category: z.string().min(1, "La categoría es obligatoria"),
    title: z.string().min(5, "El título es obligatorio").max(50, "Máximo 50 caracteres"),
    urlProduct: z
      .string()
      .url("Debe ser una URL válida")
      .refine((url) => url.startsWith("http"), {
        message: "La URL debe comenzar con http o https"
      }),
    urlImage: z
      .string()
      .url("Debe ser una URL válida")
      .refine((url) => url.startsWith("http"), {
        message: "La URL debe comenzar con http o https"
      }),
    startDate: z.custom<CalendarDate>((val) => !!val, "La fecha es requerida"),
    endDate: z.custom<CalendarDate>((val) => !!val, "La fecha es requerida"),
    offerState: z.string().nullable(),
    isProductHidden: z.boolean()
  })
  .refine((data) => data.startDate.toString() !== data.endDate.toString(), {
    message: "La fecha de inicio y fin no pueden ser el mismo día",
    path: ["endDate"]
  });

export const productToMoveFormSchema = z.object({
  neworderSellout: z
    .number({
      required_error: "El orden sellout es obligatorio",
      invalid_type_error: "Debe ser un número"
    })
    .int("Debe ser un número entero")
    .positive("Debe ser un número positivo")
    .max(999, "Debe contener máximo 3 números")
});

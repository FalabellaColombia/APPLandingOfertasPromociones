import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-rac";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, OFFER_STATES } from "@/constants/product";
import { useProducts } from "@/hooks/useProducts";
import { CalendarIcon } from "lucide-react";
import {
  Button as ButtonAria,
  DatePicker,
  Dialog as DialogAria,
  Group,
  Label as LabelAria,
  Popover
} from "react-aria-components";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Loader } from "./Loader";
import { DateInput } from "./ui/datefield-rac";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue
} from "./ui/multi-select";
import { SelectNative } from "./ui/select-native";

export default function Form() {
  const { isFormButtonLoading, errors, register, handleSubmit, Controller, control, isFormEditingOpen, onSubmitForm } =
    useProducts();

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmitForm)}>
      <h3 className="mb-5 font-bold border-b-1 pb-3">{isFormEditingOpen ? "Editar Producto" : "Agregar Producto"}</h3>

      {/* Order Sellout */}
      <FormField label="Orden Sellout" error={errors.orderSellout} htmlFor="orderSellout">
        <Input
          type="number"
          disabled
          className="peer w-full text-muted-foreground"
          id="orderSellout"
          aria-invalid={!!errors.orderSellout}
          {...register("orderSellout", { valueAsNumber: true })}
        />
      </FormField>

      {/* Categories */}
      <FormField label="Categorías" error={errors.category}>
        <Controller
          name="category"
          control={control}
          render={({ field: { value = [], onChange }, fieldState: { error } }) => (
            <MultiSelect values={Array.isArray(value) ? value : []} onValuesChange={onChange} options={CATEGORIES}>
              <MultiSelectTrigger
                className="w-full"
                hasError={!!error}
                style={error ? { borderColor: "rgb(248 113 113)" } : undefined}
              >
                <MultiSelectValue placeholder="Selecciona categorías..." />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {CATEGORIES.map((cat) => (
                    <MultiSelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
          )}
        />
      </FormField>

      {/* Title */}
      <FormField label="Llamado" error={errors.title} htmlFor="title">
        <Input
          id="title"
          className="peer"
          placeholder="Nombre del producto"
          type="text"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
      </FormField>

      {/* URL Product */}
      <FormField label="URL" error={errors.urlProduct} htmlFor="urlProduct">
        <Input
          id="urlProduct"
          className="peer"
          placeholder="https://ejemplo.com/producto"
          type="url"
          aria-invalid={!!errors.urlProduct}
          {...register("urlProduct")}
        />
      </FormField>

      {/* URL Image */}
      <FormField label="URL Imagen" error={errors.urlImage} htmlFor="urlImage">
        <Input
          id="urlImage"
          className="peer"
          placeholder="https://ejemplo.com/imagen.jpg"
          type="url"
          aria-invalid={!!errors.urlImage}
          {...register("urlImage")}
        />
      </FormField>

      {/* Dates */}
      <div className="flex justify-between space-x-3 mb-3">
        <DateField name="startDate" label="Fecha Inicio" control={control} />
        <DateField name="endDate" label="Fecha Fin" control={control} />
      </div>

      {/* Offer State */}
      <FormField label="Estado Oferta" error={errors.offerState} htmlFor="offerState">
        <SelectNative
          id="offerState"
          className="peer bg-muted border-transparent shadow-none"
          aria-invalid={!!errors.offerState}
          {...register("offerState")}
        >
          {OFFER_STATES.map((state) => (
            <option key={String(state.value)} value={state.value ?? ""}>
              {state.value ?? "Sin estado"}
            </option>
          ))}
        </SelectNative>
      </FormField>

      {/* Submit Button */}
      <Button type="submit" className="w-full mt-1" disabled={isFormButtonLoading}>
        {isFormButtonLoading ? <Loader /> : isFormEditingOpen ? "Editar" : "Agregar"}
      </Button>
    </form>
  );
}

// Reusable component for form fields (label + input + error message)
function FormField({
  label,
  error,
  htmlFor,
  children,
  labelClassName = "text-sm font-medium"
}: {
  label: string;
  error?: { message?: string };
  htmlFor?: string;
  children: React.ReactNode;
  labelClassName?: string;
}) {
  return (
    <div className="*:not-first:mt-1 mb-3 w-full">
      <Label
        className={htmlFor === "orderSellout" ? `${labelClassName} text-muted-foreground` : labelClassName}
        htmlFor={htmlFor}
      >
        {label}
      </Label>
      {children}
      {error?.message && (
        <p className="text-red-400 mt-1 text-xs" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Reusable component for date fields
type DateFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
};

function DateField<T extends FieldValues>({ name, label, control }: DateFieldProps<T>) {
  return (
    <div className="*:not-first:mt-1 w-full">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <DatePicker
              value={value ?? null}
              onChange={onChange}
              className={`*:not-first:mt-1 ${error ? "border-red-500" : ""}`}
              data-testid={name}
            >
              <LabelAria className="text-foreground text-sm font-medium">{label}</LabelAria>

              <div className="flex">
                <Group className="w-full">
                  <div data-testid={`${name}-wrapper`}>
                    <DateInput className={error ? "border-red-400 pe-9" : "pe-9"} />
                  </div>
                </Group>

                <ButtonAria className="text-muted-foreground/80 hover:text-foreground z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md">
                  <CalendarIcon size={16} />
                </ButtonAria>
              </div>

              <Popover
                className={`bg-background rounded-lg border shadow-lg ${name === "endDate" ? "!z-[9999]" : "z-50"}`}
                offset={4}
              >
                <DialogAria className="max-h-[inherit] overflow-auto p-2">
                  <Calendar />
                </DialogAria>
              </Popover>
            </DatePicker>

            {error && (
              <p className="text-red-400 mt-1 text-xs" role="alert">
                {error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}

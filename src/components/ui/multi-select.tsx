"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode
} from "react";

type MultiSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, ReactNode>;
  single: boolean;
  onItemAdded: (value: string, label: ReactNode) => void;
};

const MultiSelectContext = createContext<MultiSelectContextType | null>(null);

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error("MultiSelect components must be used within MultiSelect");
  }
  return context;
}

export function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
  single = false,
  options
}: {
  children: ReactNode;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  single?: boolean;
  options?: readonly { value: string; label: ReactNode }[];
}) {
  const [open, setOpen] = useState(false);
  const [internalValues, setInternalValues] = useState(new Set<string>(values ?? defaultValues));
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

  useEffect(() => {
    if (!options) return;

    setItems(new Map(options.map((opt) => [opt.value, opt.label])));
  }, [options]);

  useEffect(() => {
    if (values) {
      setInternalValues(new Set(values));
    }
  }, [values]);

  const selectedValues = useMemo(() => {
    return values ? new Set(values) : internalValues;
  }, [values, internalValues]);

  const toggleValue = useCallback(
    (value: string) => {
      const getNewSet = (prev: Set<string>) => {
        if (single) {
          return prev.has(value) ? new Set<string>() : new Set<string>([value]);
        }
        const newSet = new Set(prev);
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
        return newSet;
      };

      const newSet = getNewSet(selectedValues);
      setInternalValues(newSet);
      onValuesChange?.([...newSet]);
      if (single) setOpen(false);
    },
    [selectedValues, onValuesChange, single]
  );

  const onItemAdded = useCallback((value: string, label: ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev;
      return new Map(prev).set(value, label);
    });
  }, []);

  return (
    <MultiSelectContext.Provider
      value={{
        open,
        setOpen,
        selectedValues,
        single,
        toggleValue,
        items,
        onItemAdded
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
}

export function MultiSelectTrigger({
  className,
  children,
  hasError,
  ...props
}: {
  className?: string;
  children?: ReactNode;
  hasError?: boolean;
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext();

  return (
    <PopoverTrigger asChild>
      <Button
        {...props}
        variant={props.variant ?? "outline"}
        role={props.role ?? "combobox"}
        aria-expanded={props["aria-expanded"] ?? open}
        aria-invalid={hasError}
        className={cn("flex h-auto min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5", className)}
      >
        {children}
        <ChevronsUpDownIcon className="size-4 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

export function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  className,
  ...props
}: {
  placeholder?: string;
  clickToRemove?: boolean;
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const { selectedValues, toggleValue, items, single } = useMultiSelectContext();

  if (selectedValues.size === 0 && placeholder) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  if (single && selectedValues.size > 0) {
    const firstValue = [...selectedValues][0];
    return <span>{items.get(firstValue) || firstValue}</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {[...selectedValues].map((value) => (
        <Badge
          key={value}
          variant="outline"
          onClick={
            clickToRemove
              ? (e) => {
                  e.stopPropagation();
                  toggleValue(value);
                }
              : undefined
          }
          className="cursor-pointer"
        >
          {items.get(value) || value}
          {clickToRemove && <XIcon className="ml-1 size-3" />}
        </Badge>
      ))}
    </div>
  );
}

export function MultiSelectContent({
  search = true,
  children,
  ...props
}: {
  search?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Command>, "children">) {
  return (
    <PopoverContent className="p-0">
      <Command {...props}>
        {search && <CommandInput placeholder="Buscar..." />}
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          {children}
        </CommandList>
      </Command>
    </PopoverContent>
  );
}

export function MultiSelectItem({
  value,
  children,
  onSelect,
  ...props
}: {
  value: string;
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext();

  const isSelected = selectedValues.has(value);

  useLayoutEffect(() => {
    onItemAdded(value, children);
  }, [value, children, onItemAdded]);

  return (
    <CommandItem
      {...props}
      onSelect={() => {
        toggleValue(value);
        onSelect?.(value);
      }}
    >
      <CheckIcon className={cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0")} />
      {children}
    </CommandItem>
  );
}

export function MultiSelectGroup(props: ComponentPropsWithoutRef<typeof CommandGroup>) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(props: ComponentPropsWithoutRef<typeof CommandSeparator>) {
  return <CommandSeparator {...props} />;
}

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Option interface for dropdown items
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Props for the reusable dropdown component
interface DropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  options: DropdownOption[];
  rules?: any;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

// Reusable Dropdown component
export function Dropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  rules,
  disabled = false,
  className,
  onValueChange,
}: DropdownProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value?.toString() || "none"}
              onValueChange={(value) => {
                // Let the custom onValueChange handle the conversion if provided
                if (onValueChange) {
                  onValueChange(value);
                } else {
                  // Default behavior: just pass the string value
                  field.onChange(value);
                }
              }}
              disabled={disabled}
            >
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

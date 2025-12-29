import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { CurrencyModel } from "@/models/currencies";

interface CurrencyDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  currencies?: CurrencyModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function CurrencyDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  currencies,
  label = "Mata Uang",
  placeholder = "Pilih mata uang",
  rules,
  disabled,
  className,
  onValueChange,
}: CurrencyDropdownProps<TFieldValues>) {
  return (
    <Dropdown
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      rules={rules}
      disabled={disabled}
      className={className}
      onValueChange={onValueChange}
      options={currencies?.map((currency) => ({
        value: currency.code,
        label: `${currency.code} - ${currency.name} (${currency.symbol})`
      })) || []}
    />
  );
}

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";

interface InstrumentDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  instruments?: InvestmentInstrumentModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function InstrumentDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  instruments,
  label = "Instrumen Investasi",
  placeholder = "Pilih instrumen",
  rules,
  disabled,
  className,
  onValueChange,
}: InstrumentDropdownProps<TFieldValues>) {
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
      options={instruments?.map((instrument) => ({
        value: instrument.id.toString(),
        label: instrument.name
      })) || []}
    />
  );
}

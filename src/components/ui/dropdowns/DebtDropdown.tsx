import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { DebtModel } from "@/models/debts";

interface DebtDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  debts?: DebtModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function DebtDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  debts,
  label = "Hutang/Piutang",
  placeholder = "Pilih hutang/piutang",
  rules,
  disabled,
  className,
  onValueChange,
}: DebtDropdownProps<TFieldValues>) {
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
      options={debts?.map((debt) => ({
        value: debt.id.toString(),
        label: `${debt.name} (${debt.type === 'loan' ? 'Hutang' : 'Piutang'})`
      })) || []}
    />
  );
}

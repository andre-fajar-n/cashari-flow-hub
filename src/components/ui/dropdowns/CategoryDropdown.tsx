import { Control, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { CategoryModel } from "@/models/categories";

interface CategoryDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  categories?: CategoryModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  showType?: boolean; // Show (Pemasukan)/(Pengeluaran) suffix
  valueAsNumber?: boolean; // Convert value to number
  onValueChange?: (value: string) => void;
}

export function CategoryDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  categories,
  label = "Kategori",
  placeholder = "Pilih kategori",
  rules,
  disabled,
  className,
  showType = false,
  valueAsNumber = false,
  onValueChange,
}: CategoryDropdownProps<TFieldValues>) {
  const handleValueChange = valueAsNumber 
    ? (value: string) => {
        onValueChange?.(value);
      }
    : onValueChange;

  return (
    <Dropdown
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      rules={rules}
      disabled={disabled}
      className={className}
      onValueChange={handleValueChange}
      options={categories?.map((category) => ({
        value: category.id.toString(),
        label: showType 
          ? `${category.name} ${category.is_income ? "(Pemasukan)" : "(Pengeluaran)"}`
          : category.name
      })) || []}
    />
  );
}

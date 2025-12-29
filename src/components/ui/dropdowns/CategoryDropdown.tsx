import { Control, FieldPath, FieldValues } from "react-hook-form";
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
  onValueChange,
}: CategoryDropdownProps<TFieldValues>) {
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
      options={categories?.map((category) => ({
        value: category.id.toString(),
        label: showType 
          ? `${category.name} ${category.is_income ? "(Pemasukan)" : "(Pengeluaran)"}`
          : category.name
      })) || []}
    />
  );
}

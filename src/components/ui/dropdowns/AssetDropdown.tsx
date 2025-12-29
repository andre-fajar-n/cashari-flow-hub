import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { InvestmentAssetModel } from "@/models/investment-assets";

interface AssetDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  assets?: InvestmentAssetModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function AssetDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  assets,
  label = "Aset Investasi",
  placeholder = "Pilih aset",
  rules,
  disabled,
  className,
  onValueChange,
}: AssetDropdownProps<TFieldValues>) {
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
      options={assets?.map((asset) => ({
        value: asset.id.toString(),
        label: asset.symbol ? `${asset.name} (${asset.symbol})` : asset.name
      })) || []}
    />
  );
}

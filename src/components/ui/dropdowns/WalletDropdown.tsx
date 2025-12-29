import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { WalletModel } from "@/models/wallets";

interface WalletDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  wallets?: WalletModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function WalletDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  wallets,
  label = "Dompet",
  placeholder = "Pilih dompet",
  rules,
  disabled,
  className,
  onValueChange,
}: WalletDropdownProps<TFieldValues>) {
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
      options={wallets?.map((wallet) => ({
        value: wallet.id.toString(),
        label: `${wallet.name} (${wallet.currency_code})`
      })) || []}
    />
  );
}

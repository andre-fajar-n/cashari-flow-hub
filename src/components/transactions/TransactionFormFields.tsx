import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputNumber } from "@/components/ui/input-number";
import { WalletDropdown, CategoryDropdown } from "@/components/ui/dropdowns";
import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";

interface TransactionFormFieldsProps {
  control: Control<any>;
  wallets?: WalletModel[];
  categories?: CategoryModel[];
}

const TransactionFormFields = ({ control, wallets, categories }: TransactionFormFieldsProps) => {

  return (
    <>
      <WalletDropdown
        control={control}
        name="wallet_id"
        wallets={wallets}
        rules={{ required: "Dompet harus dipilih" }}
      />

      <CategoryDropdown
        control={control}
        name="category_id"
        categories={categories}
        showType={true}
        rules={{ required: "Kategori harus dipilih" }}
      />

      <FormField
        control={control}
        name="amount"
        rules={{ required: "Jumlah harus diisi", min: { value: 0, message: "Jumlah harus lebih dari 0" } }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jumlah</FormLabel>
            <FormControl>
              <InputNumber
                {...field}
                onChange={(value) => field.onChange(value)}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deskripsi (Opsional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Masukkan deskripsi" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="date"
        rules={{ required: "Tanggal harus diisi" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TransactionFormFields;

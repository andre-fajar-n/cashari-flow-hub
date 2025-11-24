import { Control, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { InputNumber } from "@/components/ui/input-number";
import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";

interface TransactionFormFieldsProps {
  control: Control<any>;
  wallets?: WalletModel[];
  categories?: CategoryModel[];
}

const TransactionFormFields = ({ control, wallets, categories }: TransactionFormFieldsProps) => {
  const form = useFormContext();

  return (
    <>
      <Dropdown
        control={control}
        name="wallet_id"
        label="Dompet"
        placeholder="Pilih dompet"
        options={[
          { value: "none", label: "Pilih dompet" },
          ...(wallets?.map((wallet) => ({
            value: wallet.id.toString(),
            label: `${wallet.name} (${wallet.currency_code})`
          })) || [])
        ]}
        rules={{ required: "Dompet harus dipilih" }}
        onValueChange={(value) => form.setValue("wallet_id", value === "none" ? null : value)}
      />

      <Dropdown
        control={control}
        name="category_id"
        label="Kategori"
        placeholder="Pilih kategori"
        options={[
          { value: "none", label: "Pilih kategori" },
          ...(categories?.map((category) => ({
            value: category.id.toString(),
            label: `${category.name} ${category.is_income ? "(Pemasukan)" : "(Pengeluaran)"}`
          })) || [])
        ]}
        rules={{ required: "Kategori harus dipilih" }}
        onValueChange={(value) => form.setValue("category_id", value === "none" ? null : value)}
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

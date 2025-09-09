import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { InputNumber } from "@/components/ui/input-number";

interface TransactionFormFieldsProps {
  control: Control<any>;
  wallets?: any[];
  categories?: any[];
}

const TransactionFormFields = ({ control, wallets, categories }: TransactionFormFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="wallet_id"
        rules={{ required: "Dompet harus dipilih" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dompet</FormLabel>
            <FormControl>
              <SearchableSelect
                options={wallets?.map((wallet) => ({
                  label: `${wallet.name} (${wallet.currency_code})`,
                  value: wallet.id.toString()
                })) || []}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Pilih dompet"
                searchPlaceholder="Cari dompet..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category_id"
        rules={{ required: "Kategori harus dipilih" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kategori</FormLabel>
            <FormControl>
              <SearchableSelect
                options={categories?.map((category) => ({
                  label: `${category.name} ${category.is_income ? "(Pemasukan)" : "(Pengeluaran)"}`,
                  value: category.id.toString()
                })) || []}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Pilih kategori"
                searchPlaceholder="Cari kategori..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="amount"
        rules={{ required: "Jumlah harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
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

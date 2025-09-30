import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputNumber } from "@/components/ui/input-number";
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
      <FormField
        control={control}
        name="wallet_id"
        rules={{ required: "Dompet harus dipilih" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dompet</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {wallets?.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id.toString()}>
                    {wallet.name} ({wallet.currency_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name} {category.is_income ? "(Pemasukan)" : "(Pengeluaran)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

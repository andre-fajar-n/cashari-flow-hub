
import { useForm } from "react-hook-form";
import { useCreateTransaction } from "@/hooks/queries/useTransactions";
import { useWallets } from "@/hooks/queries/useWallets";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCurrencies } from "@/hooks/queries/useCurrencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  currency_code: string;
  date: string;
  description?: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
}

const TransactionForm = ({ onSuccess }: TransactionFormProps) => {
  const form = useForm<TransactionFormData>({
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: "",
    },
  });

  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();

  const onSubmit = (data: TransactionFormData) => {
    createTransaction({
      amount: data.amount,
      category_id: parseInt(data.category_id),
      wallet_id: parseInt(data.wallet_id),
      currency_code: data.currency_code,
      date: data.date,
      description: data.description || null,
    }, {
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil ditambahkan",
        });
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
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
          control={form.control}
          name="category_id"
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
          control={form.control}
          name="wallet_id"
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
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mata Uang</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata uang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies?.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
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

        <FormField
          control={form.control}
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

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;

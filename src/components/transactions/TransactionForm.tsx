
import { useForm } from "react-hook-form";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/queries/useTransactions";
import { useWallets } from "@/hooks/queries/useWallets";
import { useCategories } from "@/hooks/queries/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  date: string;
  description?: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
  editData?: any;
}

const TransactionForm = ({ onSuccess, editData }: TransactionFormProps) => {
  const form = useForm<TransactionFormData>({
    defaultValues: {
      amount: editData?.amount || 0,
      category_id: editData?.category_id?.toString() || "",
      wallet_id: editData?.wallet_id?.toString() || "",
      date: editData?.date || new Date().toISOString().split('T')[0],
      description: editData?.description || "",
    },
  });

  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();

  const isPending = isCreating || isUpdating;
  const selectedWalletId = form.watch("wallet_id");
  const selectedWallet = wallets?.find(w => w.id.toString() === selectedWalletId);

  const onSubmit = (data: TransactionFormData) => {
    console.log("Form submitted with data:", data);
    
    if (!selectedWallet) {
      toast({
        title: "Error",
        description: "Pilih dompet terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!data.amount || data.amount <= 0) {
      toast({
        title: "Error",
        description: "Masukkan jumlah yang valid",
        variant: "destructive",
      });
      return;
    }

    if (!data.category_id) {
      toast({
        title: "Error",
        description: "Pilih kategori terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      amount: data.amount,
      category_id: parseInt(data.category_id),
      wallet_id: parseInt(data.wallet_id),
      currency_code: selectedWallet.currency_code,
      date: data.date,
      description: data.description || null,
    };

    console.log("Submitting transaction:", transactionData);

    if (editData) {
      updateTransaction({
        id: editData.id,
        ...transactionData,
      }, {
        onSuccess: () => {
          console.log("Transaction updated successfully");
          toast({
            title: "Berhasil",
            description: "Transaksi berhasil diperbarui",
          });
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Error updating transaction:", error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } else {
      createTransaction(transactionData, {
        onSuccess: () => {
          console.log("Transaction created successfully");
          toast({
            title: "Berhasil",
            description: "Transaksi berhasil ditambahkan",
          });
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Error creating transaction:", error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          {isPending ? (editData ? "Memperbarui..." : "Menyimpan...") : (editData ? "Perbarui Transaksi" : "Simpan Transaksi")}
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;

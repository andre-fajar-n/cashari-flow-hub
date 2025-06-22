
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useWallets } from "@/hooks/queries/useWallets";
import { useCategories } from "@/hooks/queries/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useDefaultCurrency } from "@/hooks/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  date: string;
  description?: string;
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any;
  onSuccess?: () => void;
}

const TransactionDialog = ({ open, onOpenChange, transaction, onSuccess }: TransactionDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const defaultCurrency = useDefaultCurrency();
  
  const form = useForm<TransactionFormData>({
    defaultValues: {
      amount: transaction?.amount || 0,
      category_id: transaction?.category_id?.toString() || "",
      wallet_id: transaction?.wallet_id?.toString() || "",
      date: transaction?.date || new Date().toISOString().split('T')[0],
      description: transaction?.description || "",
    },
  });
  const selectedWalletId = form.watch("wallet_id");
  const selectedWallet = wallets?.find(w => w.id.toString() === selectedWalletId);

  const onSubmit = async (data: TransactionFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const transactionData = {
        amount: data.amount,
        category_id: parseInt(data.category_id),
        wallet_id: parseInt(data.wallet_id),
        currency_code: selectedWallet.currency_code,
        date: data.date,
        description: data.description || null,
      };

      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from("transactions")
          .update({
            ...transactionData
          })
          .eq("id", transaction.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Transaksi berhasil diperbarui" });
      } else {
        // Create new transaction
        const { error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            ...transactionData,
          });

        if (error) throw error;
        toast({ title: "Transaksi berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan transaksi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when transaction prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (transaction) {
        form.reset({
          amount: transaction?.amount || 0,
          category_id: transaction?.category_id?.toString() || "",
          wallet_id: transaction?.wallet_id?.toString() || "",
          date: transaction?.date || new Date().toISOString().split('T')[0],
          description: transaction?.description || "",
        });
      } else {
        form.reset({
          amount: 0,
          category_id: "",
          wallet_id: "",
          date: new Date().toISOString().split('T')[0],
          description: "",
        });
      }
    }
  }, [transaction, open, form, defaultCurrency]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Tambah Transaction Baru"}
          </DialogTitle>
        </DialogHeader>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : transaction ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;

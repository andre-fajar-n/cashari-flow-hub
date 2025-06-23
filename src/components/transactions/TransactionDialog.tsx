
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useWallets } from "@/hooks/queries/useWallets";
import { useCategories } from "@/hooks/queries/useCategories";
import { useDebts } from "@/hooks/queries/useDebts";
import { useBudgets } from "@/hooks/queries/useBudgets";
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
  debt_id?: string;
  budget_id?: string;
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
  const { data: debts } = useDebts();
  const { data: budgets } = useBudgets();
  const defaultCurrency = useDefaultCurrency();
  
  const form = useForm<TransactionFormData>({
    defaultValues: {
      amount: transaction?.amount || 0,
      category_id: transaction?.category_id?.toString() || "",
      wallet_id: transaction?.wallet_id?.toString() || "",
      date: transaction?.date || new Date().toISOString().split('T')[0],
      description: transaction?.description || "",
      debt_id: "none",
      budget_id: "none",
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

      let transactionId: number;

      if (transaction) {
        // Update existing transaction
        const { data: updatedTransaction, error } = await supabase
          .from("transactions")
          .update({
            ...transactionData
          })
          .eq("id", transaction.id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        transactionId = updatedTransaction.id;
        toast({ title: "Transaksi berhasil diperbarui" });
      } else {
        // Create new transaction
        const { data: newTransaction, error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            ...transactionData,
          })
          .select()
          .single();

        if (error) throw error;
        transactionId = newTransaction.id;
        toast({ title: "Transaksi berhasil ditambahkan" });
      }

      // Handle debt association
      if (data.debt_id && data.debt_id !== "none") {
        await supabase
          .from("debt_histories")
          .insert({
            user_id: user.id,
            debt_id: parseInt(data.debt_id),
            wallet_id: parseInt(data.wallet_id),
            amount: data.amount,
            currency_code: selectedWallet.currency_code,
            date: data.date,
            description: data.description || null,
          });
      }

      // Handle budget association
      if (data.budget_id && data.budget_id !== "none") {
        await supabase
          .from("budget_items")
          .insert({
            budget_id: parseInt(data.budget_id),
            transaction_id: transactionId,
          });
      }

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
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
          debt_id: "none",
          budget_id: "none",
        });
      } else {
        form.reset({
          amount: 0,
          category_id: "",
          wallet_id: "",
          date: new Date().toISOString().split('T')[0],
          description: "",
          debt_id: "none",
          budget_id: "none",
        });
      }
    }
  }, [transaction, open, form, defaultCurrency]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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

            <FormField
              control={form.control}
              name="debt_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kaitkan dengan Hutang/Piutang (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hutang/piutang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {debts?.map((debt) => (
                        <SelectItem key={debt.id} value={debt.id.toString()}>
                          {debt.name} ({debt.type === 'loan' ? 'Hutang' : 'Piutang'})
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
              name="budget_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kaitkan dengan Budget (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih budget" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {budgets?.map((budget) => (
                        <SelectItem key={budget.id} value={budget.id.toString()}>
                          {budget.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

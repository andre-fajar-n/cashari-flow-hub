
import { useState } from "react";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useCategories } from "@/hooks/queries/use-categories";
import { useDebts } from "@/hooks/queries/use-debts";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useBusinessProjects } from "@/hooks/queries/use-business-projects";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import TransactionFormFields from "@/components/transactions/TransactionFormFields";
import TransactionAssociationFields from "@/components/transactions/TransactionAssociationFields";

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
  const { data: businessProjects } = useBusinessProjects();
  
  const { form } = useTransactionForm(transaction, open);

  const selectedWalletId = form.watch("wallet_id");
  const selectedWallet = wallets?.find(w => w.id.toString() === selectedWalletId);

  const onSubmit = async (data: any) => {
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

      // Handle business project association
      if (data.business_project_id && data.business_project_id !== "none") {
        await supabase
          .from("business_project_transactions")
          .insert({
            user_id: user.id,
            project_id: parseInt(data.business_project_id),
            transaction_id: transactionId,
          });
      }

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      onOpenChange(false);
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
            <TransactionFormFields
              control={form.control}
              wallets={wallets}
              categories={categories}
            />

            <TransactionAssociationFields
              control={form.control}
              debts={debts}
              budgets={budgets}
              businessProjects={businessProjects}
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

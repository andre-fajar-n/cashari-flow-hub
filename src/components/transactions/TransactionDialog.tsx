import { useEffect, useState } from "react";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTransactionCategories } from "@/hooks/queries/use-categories";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useBusinessProjects } from "@/hooks/queries/use-business-projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import TransactionFormFields from "@/components/transactions/TransactionFormFields";
import TransactionAssociationFields from "@/components/transactions/TransactionAssociationFields";
import { defaultTransactionFormValues, TransactionFormData } from "@/form-dto/transactions";
import { useInsertTransactionWithRelations, useUpdateTransactionWithRelations } from "@/hooks/queries/use-transaction-with-relations";
import { useForm } from "react-hook-form";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { TransactionModel } from "@/models/transactions";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionModel;
  onSuccess?: () => void;
}

const TransactionDialog = ({ open, onOpenChange, transaction, onSuccess }: TransactionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: wallets } = useWallets();
  const { data: categories } = useTransactionCategories();
  const { data: budgets } = useBudgets();
  const { data: businessProjects } = useBusinessProjects();
  const insertTransactionWithRelations = useInsertTransactionWithRelations();
  const updateTransactionWithRelations = useUpdateTransactionWithRelations();

  const form = useForm<TransactionFormData>({
    defaultValues: defaultTransactionFormValues,
  });

  // Reset form when dialog opens with proper data
  useEffect(() => {
    if (open) {
      if (transaction) {
        // Extract budget IDs from the associations
        const budgetIds = transaction.budget_items?.map((item) => item.budget_id) || [];
        // Extract business project IDs from the associations
        const businessProjectIds = transaction.business_project_transactions?.map((item) => item.project_id) || [];

        form.reset({
          amount: transaction.amount || 0,
          category_id: transaction.category_id ? transaction.category_id.toString() : null,
          wallet_id: transaction.wallet_id ? transaction.wallet_id.toString() : null,
          date: transaction.date || new Date().toISOString().split("T")[0],
          description: transaction.description || "",
          budget_ids: budgetIds,
          business_project_ids: businessProjectIds,
        });
      } else {
        form.reset(defaultTransactionFormValues);
      }
    }
  }, [transaction, open, form]);

  // Use mutation callbacks utility
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading,
    onOpenChange,
    onSuccess,
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSACTIONS
  });

  const onSubmit = (data: TransactionFormData) => {
    setIsLoading(true);

    // Convert null values back to proper format for API
    const processedData = {
      ...data,
      category_id: data.category_id || "",
      wallet_id: data.wallet_id || "",
    };

    if (transaction) {
      updateTransactionWithRelations.mutate({ id: transaction.id, ...processedData }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      insertTransactionWithRelations.mutate(processedData, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  useEffect(() => {
    if (insertTransactionWithRelations.isSuccess || updateTransactionWithRelations.isSuccess) {
      onOpenChange(false);
      onSuccess?.();
    }
  }, [insertTransactionWithRelations.isSuccess, updateTransactionWithRelations.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Ubah Transaksi" : "Tambah Transaksi Baru"}
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
              budgets={budgets}
              businessProjects={businessProjects}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : transaction ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;

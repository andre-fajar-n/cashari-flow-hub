import { useWallets } from "@/hooks/queries/use-wallets";
import { useTransactionCategories } from "@/hooks/queries/use-categories";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useBusinessProjects } from "@/hooks/queries/use-business-projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import TransactionFormFields from "@/components/transactions/TransactionFormFields";
import TransactionAssociationFields from "@/components/transactions/TransactionAssociationFields";
import { TransactionFormData } from "@/form-dto/transactions";
import { TransactionModel } from "@/models/transactions";
import { UseFormReturn } from "react-hook-form";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TransactionFormData>;
  isLoading: boolean;
  onSubmit: (data: TransactionFormData) => void;
  transaction?: TransactionModel;
}

const TransactionDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  transaction
}: TransactionDialogProps) => {
  const { data: wallets } = useWallets();
  const { data: categories } = useTransactionCategories();
  const { data: budgets } = useBudgets();
  const { data: businessProjects } = useBusinessProjects();

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

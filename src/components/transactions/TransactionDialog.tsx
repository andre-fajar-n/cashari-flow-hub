import { useWallets } from "@/hooks/queries/use-wallets";
import { useTransactionCategories } from "@/hooks/queries/use-categories";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useBusinessProjects } from "@/hooks/queries/use-business-projects";
import { Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">
        <div className="border-b">
          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          <div className="px-6 pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {transaction ? "Ubah Transaksi" : "Tambah Transaksi Baru"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {transaction ? "Perbarui detail transaksi" : "Catat pemasukan atau pengeluaran baru"}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
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

            <div className="flex justify-end gap-2 pt-4 border-t mt-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;

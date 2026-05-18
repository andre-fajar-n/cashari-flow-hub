import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WalletDropdown, CategoryDropdown } from "@/components/ui/dropdowns";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTransactionCategories } from "@/hooks/queries/use-categories";
import { BulkTransactionUpdateData } from "@/hooks/queries/use-transactions";

interface BulkTransactionEditFormData {
  category_id: string | null;
  wallet_id: string | null;
  date: string;
  description: string;
}

interface BulkTransactionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BulkTransactionUpdateData) => void;
  isLoading: boolean;
  selectedCount: number;
}

const BulkTransactionEditDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  selectedCount,
}: BulkTransactionEditDialogProps) => {
  const { data: wallets } = useWallets();
  const { data: categories } = useTransactionCategories();

  const form = useForm<BulkTransactionEditFormData>({
    defaultValues: {
      category_id: null,
      wallet_id: null,
      date: "",
      description: "",
    },
  });

  const handleSubmit = (data: BulkTransactionEditFormData) => {
    const filtered: BulkTransactionUpdateData = {};
    if (data.category_id) filtered.category_id = data.category_id;
    if (data.wallet_id) filtered.wallet_id = data.wallet_id;
    if (data.date) filtered.date = data.date;
    if (data.description) filtered.description = data.description;
    onSubmit(filtered);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">
        <div className="border-b">
          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          <div className="px-6 pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Edit {selectedCount} Transaksi
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kosongkan kolom yang tidak ingin diubah
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <WalletDropdown
                control={form.control}
                name="wallet_id"
                wallets={wallets}
                placeholder="Tidak diubah"
              />

              <CategoryDropdown
                control={form.control}
                name="category_id"
                categories={categories}
                placeholder="Tidak diubah"
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal (Opsional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tidak diubah" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : `Perbarui ${selectedCount} Transaksi`}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkTransactionEditDialog;

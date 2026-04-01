import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputNumber } from "@/components/ui/input-number";
import { WalletDropdown, CategoryDropdown, DebtDropdown } from "@/components/ui/dropdowns";
import { DebtHistoryFormData } from "@/form-dto/debt-histories";
import { DebtHistoryModel } from "@/models/debt-histories";
import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";
import { DebtModel } from "@/models/debts";

interface DebtHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DebtHistoryFormData>;
  isLoading: boolean;
  onSubmit: (data: DebtHistoryFormData) => void;
  history?: DebtHistoryModel;
  showDebtSelection?: boolean;
  wallets?: WalletModel[];
  categories?: CategoryModel[];
  debts?: DebtModel[];
}

const DebtHistoryDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  history,
  showDebtSelection = false,
  wallets,
  categories,
  debts
}: DebtHistoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {(history ? "Ubah" : "Tambah") + " History Pembayaran"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {history ? "Perbarui data riwayat pembayaran" : "Catat riwayat pembayaran hutang/piutang"}
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 py-4 space-y-4">
            {showDebtSelection && (
              <DebtDropdown
                control={form.control}
                name="debt_id"
                debts={debts}
                rules={{ required: "Hutang/Piutang harus dipilih" }}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              rules={{ required: "Jumlah harus diisi", min: { value: 0, message: "Jumlah harus lebih dari 0" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <InputNumber
                      {...field}
                      onChange={(value) => field.onChange(value || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <WalletDropdown
              control={form.control}
              name="wallet_id"
              wallets={wallets}
              rules={{ required: "Dompet harus dipilih" }}
            />

            <CategoryDropdown
              control={form.control}
              name="category_id"
              categories={categories}
              rules={{ required: "Kategori harus dipilih" }}
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
                    <Textarea placeholder="Masukkan deskripsi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t mt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtHistoryDialog;

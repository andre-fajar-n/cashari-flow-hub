import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { useCreateDebtHistory, useUpdateDebtHistory } from "@/hooks/queries/use-debt-histories";
import { DebtHistoryFormData, defaultDebtHistoryFormValues } from "@/form-dto/debt-histories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useDebtCategories } from "@/hooks/queries/use-categories";
import { useDebts } from "@/hooks/queries/use-debts";
import { DebtHistoryModel } from "@/models/debt-histories";

interface DebtHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtId?: number; // Made optional to support usage from transaction history
  onSuccess?: () => void;
  history?: DebtHistoryModel;
  showDebtSelection?: boolean; // New prop to control debt selection visibility
}

const DebtHistoryDialog = ({
  open,
  onOpenChange,
  debtId,
  onSuccess,
  history,
  showDebtSelection = false
}: DebtHistoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createDebtHistory = useCreateDebtHistory();
  const updateDebtHistory = useUpdateDebtHistory();
  const { data: wallets } = useWallets();
  const { data: categories } = useDebtCategories();
  const { data: debts } = useDebts();

  const form = useForm<DebtHistoryFormData>({
    defaultValues: defaultDebtHistoryFormValues,
  });

  const onSubmit = async (data: DebtHistoryFormData) => {
    setIsLoading(true);

    try {
      if (history) {
        await updateDebtHistory.mutateAsync({ id: history.id, ...data });
      } else {
        await createDebtHistory.mutateAsync(data);
      }
      // Success will be handled by the useEffect below
    } catch (error) {
      // Error is already handled by the mutation hooks (toast)
      // Just reset the loading state
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (history) {
        const resetValues = {
          debt_id: history.debt_id || debtId || 0,
          wallet_id: history.wallet_id ? history.wallet_id.toString() : "",
          category_id: history.category_id ? history.category_id.toString() : "",
          amount: history.amount || 0,
          date: history.date || new Date().toISOString().split("T")[0],
          description: history.description || "",
        };
        form.reset(resetValues);
      } else {
        const resetValues = {
          ...defaultDebtHistoryFormValues,
          debt_id: debtId || 0,
        };
        form.reset(resetValues);
      }
    }
  }, [open, history, form, debtId]);

  useEffect(() => {
    if (createDebtHistory.isSuccess || updateDebtHistory.isSuccess) {
      onOpenChange(false);
      setIsLoading(false);
      onSuccess?.();
    }
  }, [createDebtHistory.isSuccess, updateDebtHistory.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{(history ? "Edit" : "Tambah") + " History Pembayaran"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {showDebtSelection && (
              <Dropdown
                control={form.control}
                name="debt_id"
                label="Hutang/Piutang"
                placeholder="Pilih hutang/piutang"
                options={debts?.map((debt) => ({
                  value: debt.id.toString(),
                  label: `${debt.name} (${debt.type === 'loan' ? 'Hutang' : 'Piutang'})`
                })) || []}
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
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Masukkan jumlah"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Dropdown
              control={form.control}
              name="wallet_id"
              label="Dompet"
              placeholder="Pilih dompet"
              options={[
                { value: "none", label: "Pilih dompet" },
                ...(wallets?.map((wallet) => ({
                  value: wallet.id.toString(),
                  label: `${wallet.name} (${wallet.currency_code})`
                })) || [])
              ]}
              rules={{ required: "Dompet harus dipilih" }}
            />

            <Dropdown
              control={form.control}
              name="category_id"
              label="Kategori"
              placeholder="Pilih kategori"
              options={[
                { value: "none", label: "Pilih kategori" },
                ...(categories?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name
                })) || [])
              ]}
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtHistoryDialog;

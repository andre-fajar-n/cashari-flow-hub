import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateDebtHistory, useUpdateDebtHistory } from "@/hooks/queries/use-debt-histories";
import { DebtHistoryFormData, defaultDebtHistoryFormValues } from "@/form-dto/debt-histories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useDebtCategories } from "@/hooks/queries/use-categories";

interface DebtHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtId: number;
  onSuccess?: () => void;
  history?: any;
}

const DebtHistoryDialog = ({ open, onOpenChange, debtId, onSuccess, history }: DebtHistoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createDebtHistory = useCreateDebtHistory();
  const updateDebtHistory = useUpdateDebtHistory();
  const { data: wallets } = useWallets();
  const { data: categories } = useDebtCategories();

  const form = useForm<DebtHistoryFormData>({
    defaultValues: defaultDebtHistoryFormValues,
  });

  const onSubmit = async (data: DebtHistoryFormData) => {
    setIsLoading(true);
    const submitData = {
      ...data,
      wallet_id: parseInt(data.wallet_id),
      category_id: parseInt(data.category_id),
    };

    if (history) {
      updateDebtHistory.mutate({ id: history.id, ...submitData } as any);
    } else {
      createDebtHistory.mutate(submitData as any);
    }
  };

  useEffect(() => {
    if (open) {
      if (history) {
        form.reset({
          debt_id: history.debt_id || debtId,
          wallet_id: history.wallet_id ? history.wallet_id.toString() : "",
          category_id: history.category_id ? history.category_id.toString() : "",
          amount: history.amount || 0,
          date: history.date || new Date().toISOString().split("T")[0],
          description: history.description || "",
        });
      } else {
        form.reset({
          debt_id: debtId,
          ...defaultDebtHistoryFormValues,
        });
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
            <FormField
              control={form.control}
              name="amount"
              rules={{ required: "Jumlah harus diisi", min: { value: 0.01, message: "Jumlah harus lebih dari 0" } }}
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

            <FormField
              control={form.control}
              name="wallet_id"
              rules={{ required: "Dompet harus dipilih" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dompet</FormLabel>
                  <FormControl>
                    <select
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Pilih dompet</option>
                      {wallets?.map((wallet) => (
                        <option key={wallet.id} value={wallet.id.toString()}>
                          {wallet.name} ({wallet.currency_code})
                        </option>
                      ))}
                    </select>
                  </FormControl>
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
                  <FormControl>
                    <select
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Pilih kategori</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
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
                    <Textarea placeholder="Masukkan deskripsi" {...field} />
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

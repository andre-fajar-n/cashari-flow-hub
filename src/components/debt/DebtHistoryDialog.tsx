
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateDebtHistory, DebtHistoryFormData } from "@/hooks/queries/use-debt-histories";
import { useWallets, useCategories, useCurrencies, useDefaultCurrency } from "@/hooks/queries";

interface DebtHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtId: number;
  debtCurrency: string;
  onSuccess?: () => void;
}

const DebtHistoryDialog = ({ open, onOpenChange, debtId, debtCurrency, onSuccess }: DebtHistoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createDebtHistory = useCreateDebtHistory();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<DebtHistoryFormData>({
    defaultValues: {
      debt_id: debtId,
      wallet_id: 0,
      category_id: 0,
      amount: 0,
      currency_code: debtCurrency,
      date: new Date().toISOString().split('T')[0],
      description: "",
      exchange_rate: 1,
    },
  });

  useEffect(() => {
    if (open && wallets && wallets.length > 0) {
      form.setValue("wallet_id", wallets[0].id);
    }
    if (open && categories && categories.length > 0) {
      const debtCategories = categories.filter(cat => cat.application === 'debt' || cat.application === null);
      if (debtCategories.length > 0) {
        form.setValue("category_id", debtCategories[0].id);
      }
    }
  }, [open, wallets, categories, form]);

  const onSubmit = async (data: DebtHistoryFormData) => {
    setIsLoading(true);
    try {
      await createDebtHistory.mutateAsync(data);
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      console.error("Error creating debt history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debtRelatedCategories = categories?.filter(cat => 
    cat.application === 'debt' || cat.application === null
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah History Hutang/Piutang</DialogTitle>
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
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Uang</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded-md">
                      {currencies?.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
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
              name="wallet_id"
              rules={{ required: "Dompet harus dipilih" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dompet</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded-md" onChange={(e) => field.onChange(parseInt(e.target.value))}>
                      <option value="">Pilih dompet</option>
                      {wallets?.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
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
                    <select {...field} className="w-full p-2 border rounded-md" onChange={(e) => field.onChange(parseInt(e.target.value))}>
                      <option value="">Pilih kategori</option>
                      {debtRelatedCategories.map((category) => (
                        <option key={category.id} value={category.id}>
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

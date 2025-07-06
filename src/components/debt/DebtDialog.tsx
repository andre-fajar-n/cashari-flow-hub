import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DEBT_TYPES } from "@/constants/enums";
import { useCreateDebt, useCurrencies, useDefaultCurrency, useUpdateDebt } from "@/hooks/queries";
import { DebtFormData, defaultDebtFormValues } from "@/form-dto/debts";

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: any;
  onSuccess?: () => void;
}

const DebtDialog = ({ open, onOpenChange, debt, onSuccess }: DebtDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const { data: currencies } = useCurrencies();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<DebtFormData>({
    defaultValues: defaultDebtFormValues,
  });

  // Reset form when debt prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (debt) {
        form.reset({
          name: debt.name || "",
          type: debt.type || DEBT_TYPES.LOAN,
          currency_code: debt.currency_code || defaultCurrency?.code || "IDR",
          due_date: debt.due_date || "",
        });
      } else {
        form.reset(defaultDebtFormValues);
      }
    }
  }, [debt, open, form, defaultCurrency]);

  const onSubmit = async (data: DebtFormData) => {
    if (!user) return;

    setIsLoading(true);
    if (debt) {
      updateDebt.mutate({ id: debt.id, ...data });
    } else {
      createDebt.mutate(data);
    }
  };

  useEffect(() => {
    if (createDebt.isSuccess || updateDebt.isSuccess) {
      onOpenChange(false);
      onSuccess?.();
    }
  }, [createDebt.isSuccess, updateDebt.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {debt ? "Edit Hutang/Piutang" : "Tambah Hutang/Piutang Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama hutang/piutang" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Tipe harus dipilih" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded-md">
                      <option value={DEBT_TYPES.LOAN}>Hutang</option>
                      <option value={DEBT_TYPES.BORROWED}>Piutang</option>
                    </select>
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
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                {isLoading ? "Menyimpan..." : debt ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtDialog;

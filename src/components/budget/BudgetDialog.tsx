import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { BudgetFormData, defaultBudgetFormValues } from "@/form-dto/budget";
import { InputNumber } from "@/components/ui/input-number";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useCreateBudget, useUpdateBudget } from "@/hooks/queries/use-budgets";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { BudgetModel } from "@/models/budgets";
interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetModel;
  onSuccess?: () => void;
}

const BudgetDialog = ({ open, onOpenChange, budget, onSuccess }: BudgetDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const updateBudget = useUpdateBudget();
  const createBudget = useCreateBudget();
  const { data: currencies } = useCurrencies();

  const form = useForm<BudgetFormData>({
    defaultValues: defaultBudgetFormValues,
  });

  // Use mutation callbacks utility
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading,
    onOpenChange,
    onSuccess,
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.BUDGETS
  });

  const onSubmit = async (data: BudgetFormData) => {
    if (!user) return;
    setIsLoading(true);

    if (budget) {
      updateBudget.mutate({ id: budget.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createBudget.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  // Reset form when budget prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (budget) {
        form.reset({
          name: budget.name || "",
          amount: budget.amount || 0,
          currency_code: budget.currency_code || "",
          start_date: budget.start_date || "",
          end_date: budget.end_date || "",
        });
      } else {
        form.reset(defaultBudgetFormValues);
      }
    }
  }, [budget, open, form]);

  useEffect(() => {
    if (createBudget.isSuccess || updateBudget.isSuccess) {
      onOpenChange(false);
      onSuccess?.();
      setIsLoading(false);
    }
  }, [createBudget.isSuccess, updateBudget.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? "Edit Budget" : "Tambah Budget Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama budget harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Budget</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama budget" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: "Jumlah harus diisi",
                min: { value: 0, message: "Jumlah tidak boleh negatif" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <InputNumber {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Dropdown
              control={form.control}
              name="currency_code"
              label="Mata Uang"
              placeholder="Pilih mata uang"
              options={currencies?.map((currency) => ({
                value: currency.code,
                label: `${currency.code} - ${currency.name}`
              })) || []}
            />

            <FormField
              control={form.control}
              name="start_date"
              rules={{ required: "Tanggal mulai harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              rules={{ required: "Tanggal selesai harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Selesai</FormLabel>
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
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : budget ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;

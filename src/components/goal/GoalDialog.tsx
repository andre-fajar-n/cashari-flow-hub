import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { defaultGoalFormValues, GoalFormData } from "@/form-dto/goals";
import { useCreateGoal, useUpdateGoal } from "@/hooks/queries/use-goals";
import { useCurrencies, useDefaultCurrency } from "@/hooks/queries/use-currencies";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: any;
  onSuccess?: () => void;
}

const GoalDialog = ({ open, onOpenChange, goal, onSuccess }: GoalDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const { data: currencies } = useCurrencies();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<GoalFormData>({
    defaultValues: defaultGoalFormValues,
  });

  const onSubmit = async (data: GoalFormData) => {
    if (!user) return;
    setIsLoading(true);
    if (goal) {
      updateGoal.mutate({ id: goal.id, ...data });
    } else {
      createGoal.mutate(data);
    }
  };

  useEffect(() => {
    if (open) {
      if (goal) {
        form.reset({
          name: goal.name || "",
          target_amount: goal.target_amount || 0,
          currency_code: goal.currency_code || defaultCurrency?.code || "IDR",
          target_date: goal.target_date || "",
        });
      } else {
        form.reset(defaultGoalFormValues);
      }
    }
  }, [goal, open, form, defaultCurrency]);

  useEffect(() => {
    if (createGoal.isSuccess || updateGoal.isSuccess) {
      onOpenChange(false);
      setIsLoading(false);
      onSuccess?.();
    }
  }, [createGoal.isSuccess, updateGoal.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? "Edit Target" : "Tambah Target Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama target harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Target</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama target" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              rules={{
                required: "Jumlah target harus diisi",
                min: { value: 1, message: "Jumlah harus lebih dari 0" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Target</FormLabel>
                  <FormControl>
                    <InputNumber {...field} />
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
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Target</FormLabel>
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
                {isLoading ? "Menyimpan..." : goal ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDialog;

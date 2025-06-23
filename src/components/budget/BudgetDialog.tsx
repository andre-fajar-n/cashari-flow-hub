
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCurrencies, useDefaultCurrency } from "@/hooks/queries";

interface BudgetFormData {
  name: string;
  amount: number;
  currency_code: string;
  start_date: string;
  end_date: string;
}

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: any;
  onSuccess?: () => void;
}

const BudgetDialog = ({ open, onOpenChange, budget, onSuccess }: BudgetDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: currencies } = useCurrencies();
  const defaultCurrency = useDefaultCurrency();
  
  const form = useForm<BudgetFormData>({
    defaultValues: {
      name: budget?.name || "",
      amount: budget?.amount || 0,
      currency_code: budget?.currency_code || defaultCurrency?.code || "IDR",
      start_date: budget?.start_date || "",
      end_date: budget?.end_date || "",
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (budget) {
        // Update existing budget
        const { error } = await supabase
          .from("budgets")
          .update({
            name: data.name,
            amount: data.amount,
            currency_code: data.currency_code,
            start_date: data.start_date,
            end_date: data.end_date,
          })
          .eq("id", budget.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Budget berhasil diperbarui" });
      } else {
        // Create new budget
        const { error } = await supabase
          .from("budgets")
          .insert({
            user_id: user.id,
            name: data.name,
            amount: data.amount,
            currency_code: data.currency_code,
            start_date: data.start_date,
            end_date: data.end_date,
          });

        if (error) throw error;
        toast({ title: "Budget berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving budget:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan budget",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when budget prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (budget) {
        form.reset({
          name: budget.name || "",
          amount: budget.amount || 0,
          currency_code: budget.currency_code || defaultCurrency?.code || "IDR",
          start_date: budget.start_date || "",
          end_date: budget.end_date || "",
        });
      } else {
        form.reset({
          name: "",
          amount: 0,
          currency_code: defaultCurrency?.code || "IDR",
          start_date: "",
          end_date: "",
        });
      }
    }
  }, [budget, open, form, defaultCurrency]);

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
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : budget ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;

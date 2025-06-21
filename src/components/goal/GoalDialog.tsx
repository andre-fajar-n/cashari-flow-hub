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

interface GoalFormData {
  name: string;
  target_amount: number;
  currency_code: string;
  target_date: string;
}

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: any;
  onSuccess?: () => void;
}

const GoalDialog = ({ open, onOpenChange, goal, onSuccess }: GoalDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: currencies } = useCurrencies();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<GoalFormData>({
    defaultValues: {
      name: goal?.name || "",
      target_amount: goal?.target_amount || "",
      currency_code: goal?.currency_code || defaultCurrency?.code || "IDR",
      target_date: goal?.target_date || "",
    },
  });

  // Reset form when goal prop changes
  useState(() => {
    if (goal) {
      form.reset({
        name: goal.name || "",
        target_amount: goal.target_amount || 0,
        currency_code: goal.currency_code || defaultCurrency?.code || "IDR",
        target_date: goal.target_date || "",
      });
    } else {
      form.reset({
        name: "",
        target_amount: 0,
        currency_code: defaultCurrency?.code || "IDR",
        target_date: "",
      });
    }
  });

  const onSubmit = async (data: GoalFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (goal) {
        // Update existing goal
        const { error } = await supabase
          .from("goals")
          .update({
            name: data.name,
            target_amount: data.target_amount,
            currency_code: data.currency_code,
            target_date: data.target_date || null,
          })
          .eq("id", goal.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Target berhasil diperbarui" });
      } else {
        // Create new goal
        const { error } = await supabase
          .from("goals")
          .insert({
            user_id: user.id,
            name: data.name,
            target_amount: data.target_amount,
            currency_code: data.currency_code,
            target_date: data.target_date || null,
          });

        if (error) throw error;
        toast({ title: "Target berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan target",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when goal prop changes or dialog opens/closes
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
        form.reset({
          name: "",
          target_amount: 0,
          currency_code: defaultCurrency?.code || "IDR",
          target_date: "",
        });
      }
    }
  }, [goal, open, form, defaultCurrency]);

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
                variant="outline" 
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

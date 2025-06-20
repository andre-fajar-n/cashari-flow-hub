
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DEBT_TYPES } from "@/constants/enums";
import type { Database } from '@/integrations/supabase/types';

interface DebtFormData {
  name: string;
  type: Database["public"]["Enums"]["debt_type"];
  currency_code: string;
  due_date: string;
}

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: any;
  onSuccess?: () => void;
}

const DebtDialog = ({ open, onOpenChange, debt, onSuccess }: DebtDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DebtFormData>({
    defaultValues: {
      name: "",
      type: DEBT_TYPES.LOAN,
      currency_code: "IDR",
      due_date: "",
    },
  });

  // Reset form when debt prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (debt) {
        form.reset({
          name: debt.name || "",
          type: debt.type || DEBT_TYPES.LOAN,
          currency_code: debt.currency_code || "IDR",
          due_date: debt.due_date || "",
        });
      } else {
        form.reset({
          name: "",
          type: DEBT_TYPES.LOAN,
          currency_code: "IDR",
          due_date: "",
        });
      }
    }
  }, [debt, open, form]);

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("code, name")
        .eq("user_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const onSubmit = async (data: DebtFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (debt) {
        // Update existing debt
        const { error } = await supabase
          .from("debts")
          .update({
            name: data.name,
            type: data.type,
            currency_code: data.currency_code,
            due_date: data.due_date || null,
          })
          .eq("id", debt.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Data berhasil diperbarui" });
      } else {
        // Create new debt
        const { error } = await supabase
          .from("debts")
          .insert({
            user_id: user.id,
            name: data.name,
            type: data.type,
            currency_code: data.currency_code,
            due_date: data.due_date || null,
          });

        if (error) throw error;
        toast({ title: "Data berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["debts"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving debt:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

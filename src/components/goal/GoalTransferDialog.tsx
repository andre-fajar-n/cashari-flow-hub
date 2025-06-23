
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
import { toast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/queries/useWallets";
import { useGoals } from "@/hooks/queries/useGoals";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoalTransferFormData {
  from_wallet_id: string;
  to_goal_id: string;
  amount_from: number;
  date: string;
}

interface GoalTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const GoalTransferDialog = ({ open, onOpenChange, onSuccess }: GoalTransferDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GoalTransferFormData>({
    defaultValues: {
      from_wallet_id: "",
      to_goal_id: "",
      amount_from: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();

  const onSubmit = async (data: GoalTransferFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fromWallet = wallets?.find(w => w.id.toString() === data.from_wallet_id);
      const toGoal = goals?.find(g => g.id.toString() === data.to_goal_id);

      if (!fromWallet || !toGoal) {
        throw new Error("Invalid wallet or goal selection");
      }

      const transferData = {
        user_id: user.id,
        from_wallet_id: parseInt(data.from_wallet_id),
        to_goal_id: parseInt(data.to_goal_id),
        amount_from: data.amount_from,
        amount_to: data.amount_from, // Same amount for goal transfers
        currency_from: fromWallet.currency_code,
        currency_to: toGoal.currency_code,
        date: data.date,
      };

      const { error } = await supabase
        .from("goal_transfers")
        .insert(transferData);

      if (error) throw error;

      toast({ title: "Transfer ke goal berhasil ditambahkan" });

      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving goal transfer:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan transfer ke goal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset({
        from_wallet_id: "",
        to_goal_id: "",
        amount_from: 0,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Dana ke Goal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="from_wallet_id"
              rules={{ required: "Dompet asal harus dipilih" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dari Dompet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dompet asal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets?.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id.toString()}>
                          {wallet.name} ({wallet.currency_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to_goal_id"
              rules={{ required: "Goal tujuan harus dipilih" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ke Goal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih goal tujuan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goals?.filter(goal => goal.is_active && !goal.is_achieved).map((goal) => (
                        <SelectItem key={goal.id} value={goal.id.toString()}>
                          {goal.name} ({goal.currency_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount_from"
              rules={{ required: "Jumlah harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <InputNumber 
                      {...field} 
                      onChange={(value) => field.onChange(value)}
                      value={field.value}
                    />
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

export default GoalTransferDialog;

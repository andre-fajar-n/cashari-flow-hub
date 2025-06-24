
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useWallets, useGoals, useInvestmentInstruments, useInvestmentAssets } from "@/hooks/queries";
import GoalTransferFormFields from "./GoalTransferFormFields";
import GoalTransferAmountFields from "./GoalTransferAmountFields";

interface GoalTransferFormData {
  from_wallet_id: string;
  from_goal_id: string;
  from_instrument_id: string;
  from_asset_id: string;
  to_wallet_id: string;
  to_goal_id: string;
  to_instrument_id: string;
  to_asset_id: string;
  amount_from: number;
  amount_to: number;
  date: string;
}

interface GoalTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: any;
  onSuccess?: () => void;
}

const GoalTransferDialog = ({ open, onOpenChange, transfer, onSuccess }: GoalTransferDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GoalTransferFormData>({
    defaultValues: {
      from_wallet_id: "none",
      from_goal_id: "none",
      from_instrument_id: "none",
      from_asset_id: "none",
      to_wallet_id: "none",
      to_goal_id: "none",
      to_instrument_id: "none",
      to_asset_id: "none",
      amount_from: 0,
      amount_to: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();

  const fromInstrumentId = form.watch("from_instrument_id");
  const toInstrumentId = form.watch("to_instrument_id");
  const amountFrom = form.watch("amount_from");

  // Filter assets based on selected instruments
  const fromAssets = assets?.filter(asset => 
    fromInstrumentId === "none" || asset.instrument_id.toString() === fromInstrumentId
  );
  const toAssets = assets?.filter(asset => 
    toInstrumentId === "none" || asset.instrument_id.toString() === toInstrumentId
  );

  // Auto-populate amount_to when same currency
  useEffect(() => {
    const fromWalletId = form.watch("from_wallet_id");
    const toWalletId = form.watch("to_wallet_id");
    const fromWallet = wallets?.find(w => w.id.toString() === fromWalletId);
    const toWallet = wallets?.find(w => w.id.toString() === toWalletId);
    const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;
    
    if (isSameCurrency && amountFrom > 0) {
      form.setValue("amount_to", amountFrom);
    }
  }, [amountFrom, form, wallets]);

  const onSubmit = async (data: GoalTransferFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const transferData = {
        user_id: user.id,
        from_wallet_id: data.from_wallet_id !== "none" ? parseInt(data.from_wallet_id) : null,
        from_goal_id: data.from_goal_id !== "none" ? parseInt(data.from_goal_id) : null,
        from_instrument_id: data.from_instrument_id !== "none" ? parseInt(data.from_instrument_id) : null,
        from_asset_id: data.from_asset_id !== "none" ? parseInt(data.from_asset_id) : null,
        to_wallet_id: data.to_wallet_id !== "none" ? parseInt(data.to_wallet_id) : null,
        to_goal_id: data.to_goal_id !== "none" ? parseInt(data.to_goal_id) : null,
        to_instrument_id: data.to_instrument_id !== "none" ? parseInt(data.to_instrument_id) : null,
        to_asset_id: data.to_asset_id !== "none" ? parseInt(data.to_asset_id) : null,
        amount_from: data.amount_from,
        amount_to: data.amount_to,
        currency_from: 'IDR',
        currency_to: 'IDR',
        date: data.date,
      };

      if (transfer) {
        const { error } = await supabase
          .from("goal_transfers")
          .update(transferData)
          .eq("id", transfer.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Transfer goal berhasil diperbarui" });
      } else {
        const { error } = await supabase
          .from("goal_transfers")
          .insert(transferData);

        if (error) throw error;
        toast({ title: "Transfer goal berhasil ditambahkan" });
      }

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
        description: "Gagal menyimpan transfer goal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && !transfer) {
      form.reset({
        from_wallet_id: "none",
        from_goal_id: "none",
        from_instrument_id: "none",
        from_asset_id: "none",
        to_wallet_id: "none",
        to_goal_id: "none",
        to_instrument_id: "none",
        to_asset_id: "none",
        amount_from: 0,
        amount_to: 0,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, transfer, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transfer ? "Edit Transfer Goal" : "Transfer Goal Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <GoalTransferFormFields
              control={form.control}
              wallets={wallets}
              goals={goals}
              instruments={instruments}
              fromAssets={fromAssets}
              toAssets={toAssets}
            />

            <GoalTransferAmountFields
              control={form.control}
              watch={form.watch}
              wallets={wallets}
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
                {isLoading ? "Menyimpan..." : transfer ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalTransferDialog;

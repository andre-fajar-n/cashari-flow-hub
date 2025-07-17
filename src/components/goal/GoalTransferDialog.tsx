
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useWallets, useGoals, useInvestmentInstruments, useInvestmentAssets, useCreateGoalTransfer, useUpdateGoalTransfer } from "@/hooks/queries";
import GoalTransferFormFields from "@/components/goal/GoalTransferFormFields";
import GoalTransferAmountFields from "@/components/goal/GoalTransferAmountFields";
import { GoalTransferConfig, getTransferModeConfig } from "@/components/goal/GoalTransferModes";
import { defaultGoalTransferFormData, GoalTransferFormData } from "@/form-dto/goal-transfers";

interface GoalTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: any;
  onSuccess?: () => void;
  transferConfig?: GoalTransferConfig;
}

const GoalTransferDialog = ({ 
  open, 
  onOpenChange, 
  transfer, 
  onSuccess,
  transferConfig 
}: GoalTransferDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const createTransfer = useCreateGoalTransfer();
  const updateTransfer = useUpdateGoalTransfer();

  const form = useForm<GoalTransferFormData>({
    defaultValues: defaultGoalTransferFormData,
  });

  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();

  const fromInstrumentId = form.watch("from_instrument_id");
  const toInstrumentId = form.watch("to_instrument_id");
  const amountFrom = form.watch("from_amount");

  // Filter assets based on selected instruments
  const fromAssets = assets?.filter(asset => 
    fromInstrumentId === 0 || asset.instrument_id === fromInstrumentId
  );
  const toAssets = assets?.filter(asset => 
    toInstrumentId === 0 || asset.instrument_id === toInstrumentId
  );

  // Auto-populate to_amount when same currency
  useEffect(() => {
    const fromWalletId = form.watch("from_wallet_id");
    const toWalletId = form.watch("to_wallet_id");
    const fromWallet = wallets?.find(w => w.id === fromWalletId);
    const toWallet = wallets?.find(w => w.id === toWalletId);
    const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;
    
    if (isSameCurrency && amountFrom > 0) {
      form.setValue("to_amount", amountFrom);
    }
  }, [amountFrom, form, wallets]);

  // Set prefilled values based on transfer config
  useEffect(() => {
    if (transferConfig && open) {
      const modeConfig = getTransferModeConfig(transferConfig.mode);
      const goalId = transferConfig.goalId;
      
      if (modeConfig.prefilledField === 'to_goal_id') {
        form.setValue("to_goal_id", goalId);
      } else if (modeConfig.prefilledField === 'from_goal_id') {
        form.setValue("from_goal_id", goalId);
      }
    }
  }, [transferConfig, open, form]);

  const onSubmit = async (data: GoalTransferFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    const transferData = {
      user_id: user.id,
      from_wallet_id: data.from_wallet_id > 0 ? data.from_wallet_id : null,
      from_goal_id: data.from_goal_id > 0 ? data.from_goal_id : null,
      from_instrument_id: data.from_instrument_id > 0 ? data.from_instrument_id : null,
      from_asset_id: data.from_asset_id > 0 ? data.from_asset_id : null,
      to_wallet_id: data.to_wallet_id > 0 ? data.to_wallet_id : null,
      to_goal_id: data.to_goal_id > 0 ? data.to_goal_id : null,
      to_instrument_id: data.to_instrument_id > 0 ? data.to_instrument_id : null,
      to_asset_id: data.to_asset_id > 0 ? data.to_asset_id : null,
      from_amount: data.from_amount,
      to_amount: data.to_amount,
      from_currency: 'IDR',
      to_currency: 'IDR',
      date: data.date,
    };

    if (transfer) {
      updateTransfer.mutate({ id: transfer.id, ...transferData });
    } else {
      createTransfer.mutate({ ...transferData });
    }
  };

  useEffect(() => {
    if (open && !transfer && !transferConfig) {
      onOpenChange(false);
      onSuccess?.();
    }
  }, [open, transfer, transferConfig]);

  const modeConfig = transferConfig ? getTransferModeConfig(transferConfig.mode) : null;
  const dialogTitle = transfer 
    ? "Edit Transfer Goal" 
    : transferConfig 
      ? modeConfig?.title || "Transfer Goal Baru"
      : "Transfer Goal Baru";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
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
              transferConfig={transferConfig}
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

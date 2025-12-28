import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import GoalTransferFormFields from "@/components/goal/GoalTransferFormFields";
import GoalTransferAmountFields from "@/components/goal/GoalTransferAmountFields";
import { GoalTransferConfig, getTransferModeConfig } from "@/components/goal/GoalTransferModes";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalModel } from "@/models/goals";
import { WalletModel } from "@/models/wallets";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";

interface GoalTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<GoalTransferFormData>;
  isLoading: boolean;
  onSubmit: (data: GoalTransferFormData) => void;
  transfer?: GoalTransferModel;
  transferConfig?: GoalTransferConfig;
  // Data props
  wallets?: WalletModel[];
  goals?: GoalModel[];
  instruments?: InvestmentInstrumentModel[];
  assets?: InvestmentAssetModel[];
}

const GoalTransferDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  transfer,
  transferConfig,
  wallets,
  goals,
  instruments,
  assets
}: GoalTransferDialogProps) => {
  const fromInstrumentId = form.watch("from_instrument_id");
  const toInstrumentId = form.watch("to_instrument_id");

  // Filter assets based on selected instruments
  const fromAssets = assets?.filter(asset =>
    fromInstrumentId === 0 || asset.instrument_id === fromInstrumentId
  );
  const toAssets = assets?.filter(asset =>
    toInstrumentId === 0 || asset.instrument_id === toInstrumentId
  );

  const modeConfig = transferConfig ? getTransferModeConfig(transferConfig.mode) : null;
  const dialogTitle = transfer
    ? "Ubah Transfer Target"
    : transferConfig
      ? modeConfig?.title || "Transfer Target Baru"
      : "Transfer Target Baru";

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
              setValue={form.setValue}
              wallets={wallets}
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
                {isLoading ? "Menyimpan..." : transfer ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalTransferDialog;

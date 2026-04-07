import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoalTransferFormFields from "@/components/goal/GoalTransferFormFields";
import GoalTransferAmountFields from "@/components/goal/GoalTransferAmountFields";
import { GoalTransferConfig, GoalTransferMode, getTransferModeConfig } from "@/components/goal/GoalTransferModes";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalModel } from "@/models/goals";
import { WalletModel } from "@/models/wallets";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";

type TabMode = "no_goal_to_goal" | "goal_to_no_goal" | "goal_to_goal";

const TAB_MODE_MAP: Record<TabMode, GoalTransferMode> = {
  no_goal_to_goal: "add_to_goal",
  goal_to_no_goal: "take_from_goal",
  goal_to_goal: "transfer_between_goals",
};

const TAB_LABELS: Record<TabMode, string> = {
  no_goal_to_goal: "Tanpa Goal → Goal",
  goal_to_no_goal: "Goal → Tanpa Goal",
  goal_to_goal: "Goal → Goal",
};

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
  assets,
}: GoalTransferDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabMode>("no_goal_to_goal");

  const fromInstrumentId = form.watch("from_instrument_id");
  const toInstrumentId = form.watch("to_instrument_id");

  // Filter assets based on selected instruments
  const fromAssets = assets?.filter(
    (asset) => fromInstrumentId === 0 || asset.instrument_id === fromInstrumentId
  );
  const toAssets = assets?.filter(
    (asset) => toInstrumentId === 0 || asset.instrument_id === toInstrumentId
  );

  // When editing an existing transfer or a specific config is provided, use that config.
  // Otherwise, derive config from the active tab.
  const resolvedMode: GoalTransferMode | undefined = transferConfig
    ? transferConfig.mode
    : TAB_MODE_MAP[activeTab];

  const resolvedConfig: GoalTransferConfig | undefined = transferConfig
    ? transferConfig
    : resolvedMode
    ? { mode: resolvedMode, goalId: 0 }
    : undefined;

  const modeConfig = resolvedConfig ? getTransferModeConfig(resolvedConfig.mode) : null;

  const dialogTitle = transfer
    ? "Ubah Transfer Target"
    : transferConfig
    ? modeConfig?.title || "Transfer Target Baru"
    : "Transfer Target Baru";

  // Whether to show tabs (only in create mode without a pre-selected config)
  const showTabs = !transfer && !transferConfig;

  const formFields = (
    <>
      <GoalTransferFormFields
        control={form.control}
        wallets={wallets}
        goals={goals}
        instruments={instruments}
        fromAssets={fromAssets}
        toAssets={toAssets}
        transferConfig={resolvedConfig}
      />

      <GoalTransferAmountFields
        control={form.control}
        watch={form.watch}
        setValue={form.setValue}
        wallets={wallets}
      />
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-background shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 shrink-0">
              <ArrowRightLeft className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{dialogTitle}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {transfer ? "Perbarui data transfer target" : "Catat perpindahan dana ke/dari target"}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {showTabs ? (
                <Tabs
                  value={activeTab}
                  onValueChange={(val) => setActiveTab(val as TabMode)}
                >
                  <TabsList className="w-full">
                    {(Object.keys(TAB_LABELS) as TabMode[]).map((tab) => (
                      <TabsTrigger key={tab} value={tab} className="flex-1 text-xs">
                        {TAB_LABELS[tab]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(Object.keys(TAB_LABELS) as TabMode[]).map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                      {formFields}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="space-y-4">
                  {formFields}
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
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

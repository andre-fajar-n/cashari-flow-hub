import { Control, useFormContext } from "react-hook-form";
import { GoalDropdown, WalletDropdown, InstrumentDropdown, AssetDropdown } from "@/components/ui/dropdowns";
import { getTransferModeConfig, GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";
import { WalletModel } from "@/models/wallets";
import { GoalModel } from "@/models/goals";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";

interface GoalTransferFormFieldsProps {
  control: Control<GoalTransferFormData>;
  wallets?: WalletModel[];
  goals?: GoalModel[];
  instruments?: InvestmentInstrumentModel[];
  fromAssets?: InvestmentAssetModel[];
  toAssets?: InvestmentAssetModel[];
  transferConfig?: GoalTransferConfig;
}

const GoalTransferFormFields = ({
  control,
  wallets,
  goals,
  instruments,
  fromAssets,
  toAssets,
  transferConfig
}: GoalTransferFormFieldsProps) => {
  const { setValue, watch } = useFormContext<GoalTransferFormData>();
  const modeConfig = transferConfig ? getTransferModeConfig(transferConfig.mode) : null;

  const fromInstrumentId = watch("from_instrument_id");
  const toInstrumentId = watch("to_instrument_id");

  const handleValueChange = (fieldName: keyof GoalTransferFormData) => (value: string) => {
    setValue(fieldName, value ? parseInt(value) : null);
  };

  return (
    <>
      {/* From Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Dari (Sumber)</h3>
        <div className="grid grid-cols-2 gap-4">
          {(!modeConfig || modeConfig.showFromGoal) && (
            <GoalDropdown
              control={control}
              name="from_goal_id"
              goals={goals}
              label="Goal Asal"
              placeholder="Pilih goal asal"
              onValueChange={handleValueChange("from_goal_id")}
            />
          )}

          <WalletDropdown
            control={control}
            name="from_wallet_id"
            wallets={wallets}
            label="Dompet Asal"
            placeholder="Pilih dompet asal"
            onValueChange={handleValueChange("from_wallet_id")}
          />

          {(!modeConfig || modeConfig.showFromInstrument) && (
            <InstrumentDropdown
              control={control}
              name="from_instrument_id"
              instruments={instruments}
              label="Instrumen Asal"
              placeholder="Pilih instrumen asal"
              onValueChange={handleValueChange("from_instrument_id")}
            />
          )}

          {(!modeConfig || modeConfig.showFromAsset) && (
            <AssetDropdown
              control={control}
              name="from_asset_id"
              assets={fromAssets}
              label="Aset Asal"
              placeholder="Pilih aset asal"
              disabled={!fromInstrumentId || (fromAssets?.length || 0) === 0}
              onValueChange={handleValueChange("from_asset_id")}
            />
          )}
        </div>
      </div>

      {/* To Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Ke (Tujuan)</h3>
        <div className="grid grid-cols-2 gap-4">
          {(!modeConfig || modeConfig.showToGoal) && (
            <GoalDropdown
              control={control}
              name="to_goal_id"
              goals={goals}
              label="Goal Tujuan"
              placeholder="Pilih goal tujuan"
              filterActive={true}
              onValueChange={handleValueChange("to_goal_id")}
            />
          )}

          <WalletDropdown
            control={control}
            name="to_wallet_id"
            wallets={wallets}
            label="Dompet Tujuan"
            placeholder="Pilih dompet tujuan"
            onValueChange={handleValueChange("to_wallet_id")}
          />

          {(!modeConfig || modeConfig.showToInstrument) && (
            <InstrumentDropdown
              control={control}
              name="to_instrument_id"
              instruments={instruments}
              label="Instrumen Tujuan"
              placeholder="Pilih instrumen tujuan"
              onValueChange={handleValueChange("to_instrument_id")}
            />
          )}

          {(!modeConfig || modeConfig.showToAsset) && (
            <AssetDropdown
              control={control}
              name="to_asset_id"
              assets={toAssets}
              label="Aset Tujuan"
              placeholder="Pilih aset tujuan"
              disabled={!toInstrumentId || (toAssets?.length || 0) === 0}
              onValueChange={handleValueChange("to_asset_id")}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default GoalTransferFormFields;

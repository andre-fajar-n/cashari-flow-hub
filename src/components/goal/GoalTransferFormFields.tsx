import { Control, useFormContext } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
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

  const NONE_VALUE = "__none__";
  const handleValueChange = (fieldName: keyof GoalTransferFormData) => (value: string) => {
    setValue(fieldName, value && value !== NONE_VALUE ? parseInt(value) : null);
  };

  return (
    <>
      {/* From Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Dari (Sumber)</h3>
        <div className="grid grid-cols-2 gap-4">
          {(!modeConfig || modeConfig.showFromGoal) && (
            <Dropdown
              control={control}
              name="from_goal_id"
              label="Goal Asal"
              placeholder="Pilih goal asal"
              options={[
                { value: NONE_VALUE, label: "Tidak ada" },
                ...(goals?.map((goal) => ({
                  value: goal.id.toString(),
                  label: `${goal.name} (${goal.currency_code})`
                })) || [])
              ]}
              onValueChange={handleValueChange("from_goal_id")}
            />
          )}

          <Dropdown
            control={control}
            name="from_wallet_id"
            label="Dompet Asal"
            placeholder="Pilih dompet asal"
            options={[
              { value: NONE_VALUE, label: "Tidak ada" },
              ...(wallets?.map((wallet) => ({
                value: wallet.id.toString(),
                label: `${wallet.name} (${wallet.currency_code})`
              })) || [])
            ]}
            onValueChange={handleValueChange("from_wallet_id")}
          />

          {(!modeConfig || modeConfig.showFromInstrument) && (
            <Dropdown
              control={control}
              name="from_instrument_id"
              label="Instrumen Asal"
              placeholder="Pilih instrumen asal"
              options={[
                { value: NONE_VALUE, label: "Tidak ada" },
                ...(instruments?.map((instrument) => ({
                  value: instrument.id.toString(),
                  label: instrument.name
                })) || [])
              ]}
              onValueChange={handleValueChange("from_instrument_id")}
            />
          )}

          {(!modeConfig || modeConfig.showFromAsset) && (
            <Dropdown
              control={control}
              name="from_asset_id"
              label="Aset Asal"
              placeholder="Pilih aset asal"
              disabled={!fromInstrumentId || (fromAssets?.length || 0) === 0}
              options={[
                { value: NONE_VALUE, label: "Tidak ada" },
                ...(fromAssets?.map((asset) => ({
                  value: asset.id.toString(),
                  label: `${asset.name} ${asset.symbol ? `(${asset.symbol})` : ''}`
                })) || [])
              ]}
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
            <Dropdown
              control={control}
              name="to_goal_id"
              label="Goal Tujuan"
              placeholder="Pilih goal tujuan"
              options={[
                { value: NONE_VALUE, label: "Tidak ada" },
                ...(goals?.filter(goal => goal.is_active && !goal.is_achieved).map((goal) => ({
                  value: goal.id.toString(),
                  label: `${goal.name} (${goal.currency_code})`
                })) || [])
              ]}
              onValueChange={handleValueChange("to_goal_id")}
            />
          )}

          <Dropdown
            control={control}
            name="to_wallet_id"
            label="Dompet Tujuan"
            placeholder="Pilih dompet tujuan"
            options={[
              { value: NONE_VALUE, label: "Tidak ada" },
              ...(wallets?.map((wallet) => ({
                value: wallet.id.toString(),
                label: `${wallet.name} (${wallet.currency_code})`
              })) || [])
            ]}
            onValueChange={handleValueChange("to_wallet_id")}
          />

          {(!modeConfig || modeConfig.showToInstrument) && (
            <Dropdown
              control={control}
              name="to_instrument_id"
              label="Instrumen Tujuan"
              placeholder="Pilih instrumen tujuan"
              options={[
                { value: NONE_VALUE, label: "Tidak ada" },
                ...(instruments?.map((instrument) => ({
                  value: instrument.id.toString(),
                  label: instrument.name
                })) || [])
              ]}
              onValueChange={handleValueChange("to_instrument_id")}
            />
          )}

          {(!modeConfig || modeConfig.showToAsset) && (
            <Dropdown
              control={control}
              name="to_asset_id"
              label="Aset Tujuan"
              placeholder="Pilih aset tujuan"
              disabled={!toInstrumentId || (toAssets?.length || 0) === 0}
              options={[
                { value: NONE_VALUE, label: "Tidak ada" },
                ...(toAssets?.map((asset) => ({
                  value: asset.id.toString(),
                  label: `${asset.name} ${asset.symbol ? `(${asset.symbol})` : ''}`
                })) || [])
              ]}
              onValueChange={handleValueChange("to_asset_id")}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default GoalTransferFormFields;

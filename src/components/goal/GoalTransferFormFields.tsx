import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getTransferModeConfig, GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";

interface GoalTransferFormFieldsProps {
  control: Control<GoalTransferFormData>;
  wallets?: any[];
  goals?: any[];
  instruments?: any[];
  fromAssets?: any[];
  toAssets?: any[];
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
  const modeConfig = transferConfig ? getTransferModeConfig(transferConfig.mode) : null;

  return (
    <>
      {/* From Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Dari (Sumber)</h3>
        <div className="grid grid-cols-2 gap-4">
          {(!modeConfig || modeConfig.showFromGoal) && (
            <FormField
              control={control}
              name="from_goal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Asal</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={[
                        { label: "Tidak ada", value: "0" },
                        ...(goals?.map((goal) => ({
                          label: `${goal.name} (${goal.currency_code})`,
                          value: goal.id.toString()
                        })) || [])
                      ]}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      placeholder="Pilih goal asal"
                      searchPlaceholder="Cari goal..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={control}
            name="from_wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dompet Asal</FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={[
                      { label: "Tidak ada", value: "0" },
                      ...(wallets?.map((wallet) => ({
                        label: `${wallet.name} (${wallet.currency_code})`,
                        value: wallet.id.toString()
                      })) || [])
                    ]}
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    placeholder="Pilih dompet asal"
                    searchPlaceholder="Cari dompet..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(!modeConfig || modeConfig.showFromInstrument) && (
            <FormField
              control={control}
              name="from_instrument_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrumen Asal</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={[
                        { label: "Tidak ada", value: "0" },
                        ...(instruments?.map((instrument) => ({
                          label: instrument.name,
                          value: instrument.id.toString()
                        })) || [])
                      ]}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      placeholder="Pilih instrumen asal"
                      searchPlaceholder="Cari instrumen..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(!modeConfig || modeConfig.showFromAsset) && (
            <FormField
              control={control}
              name="from_asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aset Asal</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={[
                        { label: "Tidak ada", value: "0" },
                        ...(fromAssets?.map((asset) => ({
                          label: `${asset.name}${asset.symbol ? ` (${asset.symbol})` : ''}`,
                          value: asset.id.toString()
                        })) || [])
                      ]}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      placeholder="Pilih aset asal"
                      searchPlaceholder="Cari aset..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* To Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Ke (Tujuan)</h3>
        <div className="grid grid-cols-2 gap-4">
          {(!modeConfig || modeConfig.showToGoal) && (
            <FormField
              control={control}
              name="to_goal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Tujuan</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={[
                        { label: "Tidak ada", value: "0" },
                        ...(goals?.filter(goal => goal.is_active && !goal.is_achieved).map((goal) => ({
                          label: `${goal.name} (${goal.currency_code})`,
                          value: goal.id.toString()
                        })) || [])
                      ]}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      placeholder="Pilih goal tujuan"
                      searchPlaceholder="Cari goal..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={control}
            name="to_wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dompet Tujuan</FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={[
                      { label: "Tidak ada", value: "0" },
                      ...(wallets?.map((wallet) => ({
                        label: `${wallet.name} (${wallet.currency_code})`,
                        value: wallet.id.toString()
                      })) || [])
                    ]}
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    placeholder="Pilih dompet tujuan"
                    searchPlaceholder="Cari dompet..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(!modeConfig || modeConfig.showToInstrument) && (
            <FormField
              control={control}
              name="to_instrument_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrumen Tujuan</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={[
                        { label: "Tidak ada", value: "0" },
                        ...(instruments?.map((instrument) => ({
                          label: instrument.name,
                          value: instrument.id.toString()
                        })) || [])
                      ]}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      placeholder="Pilih instrumen tujuan"
                      searchPlaceholder="Cari instrumen..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(!modeConfig || modeConfig.showToAsset) && (
            <FormField
              control={control}
              name="to_asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aset Tujuan</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={[
                        { label: "Tidak ada", value: "0" },
                        ...(toAssets?.map((asset) => ({
                          label: `${asset.name}${asset.symbol ? ` (${asset.symbol})` : ''}`,
                          value: asset.id.toString()
                        })) || [])
                      ]}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      placeholder="Pilih aset tujuan"
                      searchPlaceholder="Cari aset..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default GoalTransferFormFields;

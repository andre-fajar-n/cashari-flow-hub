
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface GoalTransferFormFieldsProps {
  control: Control<GoalTransferFormData>;
  wallets?: any[];
  goals?: any[];
  instruments?: any[];
  fromAssets?: any[];
  toAssets?: any[];
}

const GoalTransferFormFields = ({ 
  control, 
  wallets, 
  goals, 
  instruments, 
  fromAssets, 
  toAssets 
}: GoalTransferFormFieldsProps) => {
  return (
    <>
      {/* From Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Dari (Sumber)</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="from_wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dompet Asal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dompet asal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
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
            control={control}
            name="from_goal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Asal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih goal asal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {goals?.map((goal) => (
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
            control={control}
            name="from_instrument_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrumen Asal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih instrumen asal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {instruments?.map((instrument) => (
                      <SelectItem key={instrument.id} value={instrument.id.toString()}>
                        {instrument.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="from_asset_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aset Asal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aset asal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {fromAssets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id.toString()}>
                        {asset.name} {asset.symbol && `(${asset.symbol})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* To Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-medium mb-3">Ke (Tujuan)</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="to_wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dompet Tujuan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dompet tujuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
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
            control={control}
            name="to_goal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Tujuan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih goal tujuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
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
            control={control}
            name="to_instrument_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrumen Tujuan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih instrumen tujuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {instruments?.map((instrument) => (
                      <SelectItem key={instrument.id} value={instrument.id.toString()}>
                        {instrument.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="to_asset_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aset Tujuan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aset tujuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {toAssets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id.toString()}>
                        {asset.name} {asset.symbol && `(${asset.symbol})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default GoalTransferFormFields;

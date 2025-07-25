
import { Control, UseFormWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputDecimal } from "@/components/ui/input-decimal";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";

interface GoalTransferAmountFieldsProps {
  control: Control<GoalTransferFormData>;
  watch: UseFormWatch<GoalTransferFormData>;
  wallets?: any[];
}

const GoalTransferAmountFields = ({ control, watch, wallets }: GoalTransferAmountFieldsProps) => {
  const fromWalletId = watch("from_wallet_id");
  const toWalletId = watch("to_wallet_id");

  const fromWallet = wallets?.find(w => w.id === fromWalletId);
  const toWallet = wallets?.find(w => w.id === toWalletId);
  const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="from_amount"
          rules={{ required: "Jumlah keluar harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Keluar</FormLabel>
              <FormControl>
                <InputDecimal 
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
          control={control}
          name="to_amount"
          rules={{ required: "Jumlah masuk harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Masuk</FormLabel>
              <FormControl>
                <InputDecimal 
                  {...field} 
                  onChange={(value) => field.onChange(value)}
                  value={field.value}
                  disabled={isSameCurrency}
                />
              </FormControl>
              {isSameCurrency && (
                <p className="text-xs text-muted-foreground">
                  Otomatis sama dengan jumlah keluar (mata uang sama)
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {fromWallet && toWallet && (
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
          Transfer dari {fromWallet.name} ({fromWallet.currency_code}) ke {toWallet.name} ({toWallet.currency_code})
        </div>
      )}

      <FormField
        control={control}
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
    </>
  );
};

export default GoalTransferAmountFields;

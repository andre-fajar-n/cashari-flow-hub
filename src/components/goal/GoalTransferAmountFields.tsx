import { Control, UseFormWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";
import { WalletModel } from "@/models/wallets";

interface GoalTransferAmountFieldsProps {
  control: Control<GoalTransferFormData>;
  watch: UseFormWatch<GoalTransferFormData>;
  wallets?: WalletModel[];
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
                <InputNumber 
                  {...field} 
                  onChange={(value) => field.onChange(value || 0)}
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
                <InputNumber 
                  {...field} 
                  onChange={(value) => field.onChange(value || 0)}
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="from_amount_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Unit Keluar</FormLabel>
              <FormControl>
                <div className="relative">
                  <InputNumber
                    {...field}
                    onChange={(value) => field.onChange(value)}
                    value={field.value}
                    allowNull={true}
                    placeholder="Kosong untuk null"
                    className={`${
                      field.value === null
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : field.value === 0
                          ? "bg-orange-50 border-orange-200 text-orange-700"
                          : ""
                    }`}
                  />
                  {field.value === null && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        NULL
                      </span>
                    </div>
                  )}
                  {field.value === 0 && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                        ZERO
                      </span>
                    </div>
                  )}
                </div>
              </FormControl>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span className="text-blue-600">Kosong (null) = Tidak ada unit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                  <span className="text-orange-600">0 (zero) = Nol unit</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="to_amount_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Unit Masuk</FormLabel>
              <FormControl>
                <div className="relative">
                  <InputNumber
                    {...field}
                    onChange={(value) => field.onChange(value)}
                    value={field.value}
                    allowNull={true}
                    placeholder="Kosong untuk null"
                    className={`${
                      field.value === null
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : field.value === 0
                          ? "bg-orange-50 border-orange-200 text-orange-700"
                          : ""
                    }`}
                  />
                  {field.value === null && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        NULL
                      </span>
                    </div>
                  )}
                  {field.value === 0 && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                        ZERO
                      </span>
                    </div>
                  )}
                </div>
              </FormControl>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span className="text-blue-600">Kosong (null) = Tidak ada unit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                  <span className="text-orange-600">0 (zero) = Nol unit</span>
                </div>
              </div>
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

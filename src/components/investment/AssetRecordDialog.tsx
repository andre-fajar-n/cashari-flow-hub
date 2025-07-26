import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateGoalInvestmentRecord, useWallets, useCategories, useCurrencies, useGoals } from "@/hooks/queries";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { InvestmentAssetModel } from "@/models/investment-assets";

interface AssetRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: InvestmentAssetModel;
  onSuccess?: () => void;
}

const AssetRecordDialog = ({ open, onOpenChange, asset, onSuccess }: AssetRecordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createRecord = useCreateGoalInvestmentRecord();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();
  const { data: goals } = useGoals();

  const form = useForm<GoalInvestmentRecordFormData>({
    defaultValues: {
      ...defaultGoalInvestmentRecordFormData,
      instrument_id: asset.instrument_id,
      asset_id: asset.id,
      currency_code: asset.currency_code || 'IDR'
    },
  });

  const isValuation = form.watch("is_valuation");
  const investmentCategories = categories?.filter(cat => cat.application === 'investment') || [];

  const onSubmit = async (data: GoalInvestmentRecordFormData) => {
    setIsLoading(true);
    
    // Remove fields that should be null when not applicable
    const cleanData = {
      ...data,
      instrument_id: asset.instrument_id,
      asset_id: asset.id
    };
    
    if (isValuation) {
      cleanData.wallet_id = null;
      cleanData.category_id = null;
    } else {
      cleanData.wallet_id = data.wallet_id || null;
      cleanData.category_id = data.category_id || null;
    }

    createRecord.mutate(cleanData);
  };

  useEffect(() => {
    if (createRecord.isSuccess) {
      onOpenChange(false);
      setIsLoading(false);
      form.reset({
        ...defaultGoalInvestmentRecordFormData,
        instrument_id: asset.instrument_id,
        asset_id: asset.id,
        currency_code: asset.currency_code || 'IDR'
      });
      onSuccess?.();
    }
  }, [createRecord.isSuccess, onOpenChange, form, asset, onSuccess]);

  useEffect(() => {
    if (open) {
      form.reset({
        ...defaultGoalInvestmentRecordFormData,
        instrument_id: asset.instrument_id,
        asset_id: asset.id,
        currency_code: asset.currency_code || 'IDR'
      });
    }
  }, [open, form, asset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Record Aset - {asset.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pre-filled asset info display */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Instrumen: {asset.investment_instruments?.name}</p>
              <p className="text-sm text-muted-foreground">
                Aset: {asset.name} {asset.symbol ? `(${asset.symbol})` : ''}
              </p>
            </div>

            <FormField
              control={form.control}
              name="is_valuation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Valuation Only</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Hanya untuk pencatatan nilai, tidak melibatkan transaksi
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goals?.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id.toString()}>
                          {goal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isValuation && (
              <>
                <FormField
                  control={form.control}
                  name="wallet_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih wallet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {investmentCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="date"
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

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <InputNumber {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <InputNumber
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
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Uang</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata uang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies?.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tambahkan catatan..."
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetRecordDialog;
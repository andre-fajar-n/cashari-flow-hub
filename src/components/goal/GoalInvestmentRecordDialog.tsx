import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { Database } from "@/integrations/supabase/types";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useInvestmentAssets } from "@/hooks/queries/use-investment-assets";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useCategories } from "@/hooks/queries/use-categories";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useGoals } from "@/hooks/queries/use-goals";

interface GoalInvestmentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId?: number;
  record?: Database["public"]["Tables"]["goal_investment_records"]["Row"] | null;
  onSuccess?: () => void;
}

const GoalInvestmentRecordDialog = ({ open, onOpenChange, goalId, record, onSuccess }: GoalInvestmentRecordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();
  const { data: goals } = useGoals();

  const form = useForm<GoalInvestmentRecordFormData>({
    defaultValues: { ...defaultGoalInvestmentRecordFormData, goal_id: goalId || record?.goal_id },
  });

  // Use mutation callbacks utility
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading,
    onOpenChange,
    onSuccess,
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS
  });

  const selectedInstrument = form.watch("instrument_id");
  const isValuation = form.watch("is_valuation");

  const filteredAssets = assets?.filter(asset => asset.instrument_id === selectedInstrument) || [];

  // Fill form when editing existing record
  useEffect(() => {
    if (record && open) {
      form.setValue("goal_id", record.goal_id);
      form.setValue("instrument_id", record.instrument_id || 0);
      form.setValue("asset_id", record.asset_id || 0);
      form.setValue("wallet_id", record.wallet_id || 0);
      form.setValue("category_id", record.category_id || 0);
      form.setValue("amount", record.amount);
      form.setValue("amount_unit", record.amount_unit);
      form.setValue("currency_code", record.currency_code || "IDR");
      form.setValue("date", record.date);
      form.setValue("description", record.description || "");
      form.setValue("is_valuation", record.is_valuation || false);
    } else if (!record && open) {
      // Reset form when creating new record
      form.reset({ ...defaultGoalInvestmentRecordFormData, goal_id: goalId || 0 });
    }
  }, [record, open, form, goalId]);

  const onSubmit = async (data: GoalInvestmentRecordFormData) => {
    setIsLoading(true);
    
    // Remove fields that should be null when not applicable
    const cleanData = { ...data };
    
    if (isValuation) {
      cleanData.wallet_id = null;
      cleanData.category_id = null;
    } else {
      cleanData.wallet_id = data.wallet_id || null;
      cleanData.category_id = data.category_id || null;
    }

    if (!data.instrument_id) {
      cleanData.instrument_id = null;
    }

    if (!data.asset_id) {
      cleanData.asset_id = null;
    }

    // Keep amount_unit as is (can be 0 or null)
    cleanData.amount_unit = data.amount_unit;

    if (record) {
      updateRecord.mutate({ id: record.id, ...cleanData }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createRecord.mutate(cleanData, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? "Edit Investment Record" : "Update Progress Investasi"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Goal Selector - Only show in edit mode */}
            {record && (
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
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instrument_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrumen Investasi</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          field.onChange(value);
                          form.setValue("asset_id", null);
                        }}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Pilih Instrumen</option>
                        {instruments?.map((instrument) => (
                          <option key={instrument.id} value={instrument.id}>
                            {instrument.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aset Investasi</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          field.onChange(value);
                        }}
                        className="w-full p-2 border rounded-md"
                        disabled={!selectedInstrument}
                      >
                        <option value="">Pilih Aset</option>
                        {filteredAssets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} {asset.symbol && `(${asset.symbol})`}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isValuation && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wallet_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet</FormLabel>
                      <FormControl>
                        <select 
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            field.onChange(value);
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Pilih Wallet</option>
                          {wallets?.map((wallet) => (
                            <option key={wallet.id} value={wallet.id}>
                              {wallet.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
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
                      <FormControl>
                        <select 
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            field.onChange(value);
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Pilih Kategori</option>
                          {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                rules={{
                  required: "Jumlah amount harus diisi",
                  min: { value: 0, message: "Jumlah harus >= 0" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
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
                control={form.control}
                name="amount_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
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
                      <p className="text-muted-foreground">
                        Contoh: Saham (unit), Emas (gram), Crypto (koin)
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Uang</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border rounded-md">
                        {currencies?.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan deskripsi (opsional)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                {isLoading ? "Menyimpan..." : record ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalInvestmentRecordDialog;

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateGoalInvestmentRecord, useInvestmentInstruments, useInvestmentAssets, useWallets, useCategories, useCurrencies } from "@/hooks/queries";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";

interface GoalInvestmentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: number;
  onSuccess?: () => void;
}

const GoalInvestmentRecordDialog = ({ open, onOpenChange, goalId, onSuccess }: GoalInvestmentRecordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createRecord = useCreateGoalInvestmentRecord();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();

  const form = useForm<GoalInvestmentRecordFormData>({
    defaultValues: { ...defaultGoalInvestmentRecordFormData, goal_id: goalId },
  });

  const selectedInstrument = form.watch("instrument_id");
  const isValuation = form.watch("is_valuation");

  const filteredAssets = assets?.filter(asset => asset.instrument_id === selectedInstrument) || [];

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

    createRecord.mutate(cleanData);
  };

  useEffect(() => {
    if (createRecord.isSuccess) {
      onOpenChange(false);
      setIsLoading(false);
      form.reset({ ...defaultGoalInvestmentRecordFormData, goal_id: goalId });
      onSuccess?.();
    }
  }, [createRecord.isSuccess, onOpenChange, form, goalId, onSuccess]);

  useEffect(() => {
    if (open) {
      form.reset({ ...defaultGoalInvestmentRecordFormData, goal_id: goalId });
    }
  }, [open, form, goalId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Progress Investasi</DialogTitle>
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
                      <InputNumber {...field} />
                    </FormControl>
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
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalInvestmentRecordDialog;

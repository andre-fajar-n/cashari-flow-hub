import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Textarea } from "@/components/ui/textarea";
import { Dropdown } from "@/components/ui/dropdown";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useInvestmentAssets } from "@/hooks/queries/use-investment-assets";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useInvestmentCategories } from "@/hooks/queries/use-categories";
import { useGoals } from "@/hooks/queries/use-goals";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";

interface GoalInvestmentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId?: number;
  instrumentId?: number; // Pre-filled instrument ID (hides instrument selector)
  assetId?: number; // Pre-filled asset ID (hides asset selector)
  record?: GoalInvestmentRecordModel | null;
  onSuccess?: () => void;
}

const GoalInvestmentRecordDialog = ({ open, onOpenChange, goalId, instrumentId, assetId, record, onSuccess }: GoalInvestmentRecordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();
  const { data: wallets } = useWallets();
  const { data: categories } = useInvestmentCategories();
  const { data: goals } = useGoals();

  const form = useForm<GoalInvestmentRecordFormData>({
    defaultValues: {
      ...defaultGoalInvestmentRecordFormData,
      goal_id: goalId || record?.goal_id || null,
      instrument_id: instrumentId || record?.instrument_id || null,
      asset_id: assetId || record?.asset_id || null,
    },
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

  const filteredAssets = assets?.filter(asset => asset.instrument_id === selectedInstrument) || [];

  // Fill form when editing existing record
  useEffect(() => {
    if (record && open) {
      form.setValue("goal_id", record.goal_id || null);
      form.setValue("instrument_id", record.instrument_id || null);
      form.setValue("asset_id", record.asset_id || null);
      form.setValue("wallet_id", record.wallet_id || null);
      form.setValue("category_id", record.category_id || null);
      form.setValue("amount", record.amount);
      form.setValue("amount_unit", record.amount_unit);
      form.setValue("date", record.date);
      form.setValue("description", record.description || "");
      form.setValue("is_valuation", record.is_valuation || false);
    } else if (!record && open) {
      // Reset form when creating new record
      form.reset({
        ...defaultGoalInvestmentRecordFormData,
        goal_id: goalId || null,
        instrument_id: instrumentId || null,
        asset_id: assetId || null,
      });
    }
  }, [record, open, form, goalId, assetId]);

  const onSubmit = async (data: GoalInvestmentRecordFormData) => {
    setIsLoading(true);

    // Remove fields that should be null when not applicable
    const cleanData = { ...data };

    cleanData.wallet_id = data.wallet_id || null;
    cleanData.category_id = data.category_id || null;

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
            {/* Goal Selector - Only show when NOT called from goal detail page */}
            {!goalId && (
              <Dropdown
                control={form.control}
                name="goal_id"
                label="Goal"
                placeholder="Pilih goal"
                rules={{ required: "Goal harus dipilih" }}
                options={[
                  { value: "none", label: "Pilih goal" },
                  ...(goals?.map((goal) => ({
                    value: goal.id.toString(),
                    label: goal.name
                  })) || [])
                ]}
                onValueChange={(value) => form.setValue("goal_id", value === "none" ? null : parseInt(value))}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                control={form.control}
                name="wallet_id"
                label="Wallet"
                placeholder="Pilih Wallet"
                options={[
                  { value: "none", label: "Pilih Wallet" },
                  ...(wallets?.map((wallet) => ({
                    value: wallet.id.toString(),
                    label: wallet.name
                  })) || [])
                ]}
                onValueChange={(value) => form.setValue("wallet_id", value === "none" ? null : parseInt(value))}
              />

              <Dropdown
                control={form.control}
                name="category_id"
                label="Kategori"
                placeholder="Pilih Kategori"
                options={[
                  { value: "none", label: "Pilih Kategori" },
                  ...(categories?.map((category) => ({
                    value: category.id.toString(),
                    label: category.name
                  })) || [])
                ]}
                onValueChange={(value) => form.setValue("category_id", value === "none" ? null : parseInt(value))}
              />
            </div>

            {!instrumentId && !assetId ? (
              <div className="grid grid-cols-2 gap-4">
                {!instrumentId && (
                  <Dropdown
                    control={form.control}
                    name="instrument_id"
                    label="Instrumen Investasi"
                    placeholder="Pilih Instrumen"
                    options={[
                      { value: "none", label: "Pilih Instrumen" },
                      ...(instruments?.map((instrument) => ({
                        value: instrument.id.toString(),
                        label: instrument.name
                      })) || [])
                    ]}
                    onValueChange={(value) => {
                      form.setValue("instrument_id", value === "none" ? null : parseInt(value));
                      form.setValue("asset_id", null);
                    }}
                  />
                )}

                {!assetId && (
                  <Dropdown
                    control={form.control}
                    name="asset_id"
                    label="Aset Investasi"
                    placeholder="Pilih Aset"
                    disabled={!selectedInstrument}
                    options={[
                      { value: "none", label: "Pilih Aset" },
                      ...filteredAssets.map((asset) => ({
                        value: asset.id.toString(),
                        label: `${asset.name} ${asset.symbol ? `(${asset.symbol})` : ''}`
                      }))
                    ]}
                    onValueChange={(value) => form.setValue("asset_id", value === "none" ? null : parseInt(value))}
                  />
                )}
              </div>
            ) : (null)}

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
                          className={`${field.value === null
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

            <div className="grid grid-cols-1 gap-4">
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
                variant="ghost"
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

import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GoalDropdown, WalletDropdown, CategoryDropdown, InstrumentDropdown, AssetDropdown } from "@/components/ui/dropdowns";
import { GoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { GoalModel } from "@/models/goals";
import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";

interface GoalInvestmentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<GoalInvestmentRecordFormData>;
  isLoading: boolean;
  onSubmit: (data: GoalInvestmentRecordFormData) => void;
  record?: GoalInvestmentRecordModel | null;
  goalId?: number;
  instrumentId?: number;
  assetId?: number;
  goals?: GoalModel[];
  instruments?: InvestmentInstrumentModel[];
  assets?: InvestmentAssetModel[];
  wallets?: WalletModel[];
  categories?: CategoryModel[];
}

const GoalInvestmentRecordDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  record,
  goalId,
  instrumentId,
  assetId,
  goals,
  instruments,
  assets,
  wallets,
  categories
}: GoalInvestmentRecordDialogProps) => {
  const selectedInstrument = form.watch("instrument_id");
  const amountUnit = form.watch("amount_unit");
  const filteredAssets = assets?.filter(asset => asset.instrument_id === selectedInstrument) || [];

  const unitStateLabel =
    amountUnit === null
      ? "Tanpa satuan"
      : amountUnit === 0
      ? "Nol satuan"
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-background shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 shrink-0">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {record ? "Ubah Catatan Investasi" : "Update Progress Investasi"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {record ? "Perbarui data catatan investasi" : "Catat perkembangan investasi terbaru"}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {!goalId && (
                <GoalDropdown
                  control={form.control}
                  name="goal_id"
                  goals={goals}
                  showCurrency={false}
                  rules={{ required: "Target harus dipilih" }}
                  onValueChange={(value) => form.setValue("goal_id", value ? parseInt(value) : null)}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <WalletDropdown
                  control={form.control}
                  name="wallet_id"
                  wallets={wallets}
                  label="Dompet"
                  placeholder="Pilih Dompet"
                  onValueChange={(value) => form.setValue("wallet_id", value ? parseInt(value) : null)}
                />

                <CategoryDropdown
                  control={form.control}
                  name="category_id"
                  categories={categories}
                  label="Kategori"
                  placeholder="Pilih Kategori"
                  onValueChange={(value) => form.setValue("category_id", value ? parseInt(value) : null)}
                />
              </div>

              {!instrumentId && !assetId ? (
                <div className="grid grid-cols-2 gap-4">
                  {!instrumentId && (
                    <InstrumentDropdown
                      control={form.control}
                      name="instrument_id"
                      instruments={instruments}
                      label="Instrumen Investasi"
                      placeholder="Pilih Instrumen"
                      onValueChange={(value) => {
                        form.setValue("instrument_id", value ? parseInt(value) : null);
                        form.setValue("asset_id", null);
                      }}
                    />
                  )}

                  {!assetId && (
                    <AssetDropdown
                      control={form.control}
                      name="asset_id"
                      assets={filteredAssets}
                      label="Aset Investasi"
                      placeholder="Pilih Aset"
                      disabled={!selectedInstrument || filteredAssets.length === 0}
                      onValueChange={(value) => form.setValue("asset_id", value ? parseInt(value) : null)}
                    />
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  rules={{
                    required: "Jumlah harus diisi",
                    min: { value: 0, message: "Jumlah harus >= 0" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
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
                      <FormLabel>Satuan</FormLabel>
                      <FormControl>
                        <InputNumber
                          {...field}
                          onChange={(value) => field.onChange(value)}
                          value={field.value}
                          allowNull={true}
                          placeholder="Kosongkan jika tidak ada"
                        />
                      </FormControl>
                      {unitStateLabel && (
                        <p className="text-xs text-muted-foreground">{unitStateLabel}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Contoh: lot saham, gram emas, koin kripto. Kosongkan jika tidak relevan.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : record ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalInvestmentRecordDialog;

import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Textarea } from "@/components/ui/textarea";
import { Dropdown } from "@/components/ui/dropdown";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  // Control visibility
  goalId?: number; // Pre-filled goal ID (hides goal selector)
  instrumentId?: number; // Pre-filled instrument ID (hides instrument selector)
  assetId?: number; // Pre-filled asset ID (hides asset selector)
  // Data props
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

  const filteredAssets = assets?.filter(asset => asset.instrument_id === selectedInstrument) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? "Ubah Investment Record" : "Update Progress Investasi"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Goal Selector - Only show when NOT called from goal detail page */}
            {!goalId && (
              <Dropdown
                control={form.control}
                name="goal_id"
                label="Target"
                placeholder="Pilih target"
                rules={{ required: "Target harus dipilih" }}
                options={goals?.map((goal) => ({
                  value: goal.id.toString(),
                  label: goal.name
                })) || []}
                onValueChange={(value) => form.setValue("goal_id", value ? parseInt(value) : null)}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                control={form.control}
                name="wallet_id"
                label="Dompet"
                placeholder="Pilih Dompet"
                options={wallets?.map((wallet) => ({
                  value: wallet.id.toString(),
                  label: wallet.name
                })) || []}
                onValueChange={(value) => form.setValue("wallet_id", value ? parseInt(value) : null)}
              />

              <Dropdown
                control={form.control}
                name="category_id"
                label="Kategori"
                placeholder="Pilih Kategori"
                options={categories?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name
                })) || []}
                onValueChange={(value) => form.setValue("category_id", value ? parseInt(value) : null)}
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
                    options={instruments?.map((instrument) => ({
                      value: instrument.id.toString(),
                      label: instrument.name
                    })) || []}
                    onValueChange={(value) => {
                      form.setValue("instrument_id", value ? parseInt(value) : null);
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
                    disabled={!selectedInstrument || filteredAssets.length === 0}
                    options={filteredAssets.map((asset) => ({
                      value: asset.id.toString(),
                      label: `${asset.name} ${asset.symbol ? `(${asset.symbol})` : ''}`
                    }))}
                    onValueChange={(value) => form.setValue("asset_id", value ? parseInt(value) : null)}
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

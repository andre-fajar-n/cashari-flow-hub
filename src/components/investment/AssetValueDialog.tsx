import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AssetValueFormData } from "@/form-dto/investment-asset-values";
import { InvestmentAssetValueModel } from "@/models/investment-asset-values";
import { TrendingUp } from "lucide-react";

interface AssetValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AssetValueFormData>;
  isLoading: boolean;
  onSubmit: (data: AssetValueFormData) => void;
  assetValue?: InvestmentAssetValueModel;
}

const AssetValueDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  assetValue
}: AssetValueDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {assetValue ? "Edit Nilai Aset" : "Tambah Nilai Aset"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Catat harga pasar aset pada tanggal tertentu
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="value"
                rules={{
                  required: "Nilai aset harus diisi",
                  min: { value: 0, message: "Nilai tidak boleh negatif" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Aset</FormLabel>
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

              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : assetValue ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetValueDialog;

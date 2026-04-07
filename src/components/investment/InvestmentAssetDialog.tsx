import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InstrumentDropdown } from "@/components/ui/dropdowns";
import { AssetFormData } from "@/form-dto/investment-assets";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { Coins } from "lucide-react";

interface InvestmentAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AssetFormData>;
  isLoading: boolean;
  onSubmit: (data: AssetFormData) => void;
  asset?: InvestmentAssetModel;
  instruments?: InvestmentInstrumentModel[];
}

const InvestmentAssetDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  asset,
  instruments
}: InvestmentAssetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {asset ? "Edit Aset Investasi" : "Tambah Aset Investasi Baru"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {asset ? "Perbarui informasi aset investasi" : "Tambahkan aset baru ke dalam instrumen"}
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Nama aset harus diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Aset</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama aset" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Simbol (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: BBRI, TLKM, BTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <InstrumentDropdown
                control={form.control}
                name="instrument_id"
                instruments={instruments}
                onValueChange={(value) => form.setValue("instrument_id", value ? parseInt(value) : null)}
              />

              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : asset ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentAssetDialog;

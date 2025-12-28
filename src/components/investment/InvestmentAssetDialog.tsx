import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AssetFormData } from "@/form-dto/investment-assets";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { Dropdown } from "@/components/ui/dropdown";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {asset ? "Edit Aset Investasi" : "Tambah Aset Investasi Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Dropdown
              control={form.control}
              name="instrument_id"
              label="Instrumen Investasi"
              placeholder="Pilih Instrumen"
              options={(instruments || []).map((instrument) => ({
                value: instrument.id.toString(),
                label: instrument.name
              }))}
              onValueChange={(value) => form.setValue("instrument_id", value ? parseInt(value) : null)}
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
                {isLoading ? "Menyimpan..." : asset ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentAssetDialog;

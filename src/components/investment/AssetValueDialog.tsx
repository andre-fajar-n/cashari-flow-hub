import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AssetValueFormData } from "@/form-dto/investment-asset-values";
import { InvestmentAssetValueModel } from "@/models/investment-asset-values";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {assetValue ? "Edit Nilai Aset" : "Tambah Nilai Aset"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : assetValue ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetValueDialog;

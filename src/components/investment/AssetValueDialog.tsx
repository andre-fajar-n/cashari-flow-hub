
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputDecimal } from "@/components/ui/input-decimal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateInvestmentAssetValue, useUpdateInvestmentAssetValue } from "@/hooks/queries/use-investment-asset-values";
import { AssetValueFormData, defaultAssetValueFormValues } from "@/form-dto/investment-asset-values";

interface AssetValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetValue?: any;
  assetId?: number;
  onSuccess?: () => void;
}

const AssetValueDialog = ({ open, onOpenChange, assetValue, assetId, onSuccess }: AssetValueDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const createAssetValue = useCreateInvestmentAssetValue();
  const updateAssetValue = useUpdateInvestmentAssetValue();

  const form = useForm<AssetValueFormData>({
    defaultValues: defaultAssetValueFormValues,
  });

  const onSubmit = async (data: AssetValueFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    if (assetValue) {
      updateAssetValue.mutate({ id: assetValue.id, ...data });
    } else {
      createAssetValue.mutate(data);
    }
  };

  // Reset form when assetValue prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (assetValue) {
        form.reset({
          asset_id: assetValue.asset_id,
          value: assetValue.value,
          date: assetValue.date,
        });
      } else {
        form.reset({
          ...defaultAssetValueFormValues,
          asset_id: assetId || 0,
        });
      }
    }
  }, [assetValue, assetId, open, form]);

  useEffect(() => {
    if (createAssetValue.isSuccess || updateAssetValue.isSuccess) {
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      setIsLoading(false);
    }
  }, [createAssetValue.isSuccess, updateAssetValue.isSuccess]);

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
                    <InputDecimal
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
                variant="outline" 
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

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AssetFormData, defaultAssetFormValues } from "@/form-dto/investment-assets";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useCreateInvestmentAsset, useUpdateInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useCurrencies } from "@/hooks/queries/use-currencies";

interface InvestmentAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: any;
  onSuccess?: () => void;
}

const InvestmentAssetDialog = ({ open, onOpenChange, asset, onSuccess }: InvestmentAssetDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const createAsset = useCreateInvestmentAsset();
  const updateAsset = useUpdateInvestmentAsset();

  const form = useForm<AssetFormData>({
    defaultValues: defaultAssetFormValues,
  });

  const { data: instruments } = useInvestmentInstruments();
  const { data: currencies } = useCurrencies();

  // Use mutation callbacks utility
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading,
    onOpenChange,
    onSuccess,
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_ASSETS
  });

  const onSubmit = async (data: AssetFormData) => {
    if (!user) return;

    setIsLoading(true);

    if (asset) {
      updateAsset.mutate({ id: asset.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createAsset.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  // Reset form when asset prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (asset) {
        form.reset({
          name: asset.name || "",
          symbol: asset.symbol || "",
          instrument_id: asset.instrument_id || 0,
          currency_code: asset.currency_code || "",
        });
      } else {
        form.reset(defaultAssetFormValues);
      }
    }
  }, [asset, open, form]);

  useEffect(() => {
    if (createAsset.isSuccess || updateAsset.isSuccess) {
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      setIsLoading(false);
    }
  }, [createAsset.isSuccess, updateAsset.isSuccess]);

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

            <FormField
              control={form.control}
              name="instrument_id"
              rules={{ 
                required: "Instrumen harus dipilih",
                min: { value: 1, message: "Instrumen harus dipilih" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrumen Investasi</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full p-2 border rounded-md"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    >
                      <option value={0}>Pilih instrumen</option>
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
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency (Opsional)</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Pilih currency (default IDR)</option>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
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

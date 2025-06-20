
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface AssetFormData {
  name: string;
  symbol: string;
  instrument_id: number;
}

interface InvestmentAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: any;
  onSuccess?: () => void;
}

const InvestmentAssetDialog = ({ open, onOpenChange, asset, onSuccess }: InvestmentAssetDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AssetFormData>({
    defaultValues: {
      name: asset?.name || "",
      symbol: asset?.symbol || "",
      instrument_id: asset?.instrument_id || 0,
    },
  });

  const { data: instruments } = useQuery({
    queryKey: ["investment_instruments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_instruments")
        .select("id, name")
        .eq("user_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const onSubmit = async (data: AssetFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (asset) {
        // Update existing asset
        const { error } = await supabase
          .from("investment_assets")
          .update({
            name: data.name,
            symbol: data.symbol,
            instrument_id: data.instrument_id,
          })
          .eq("id", asset.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Aset berhasil diperbarui" });
      } else {
        // Create new asset
        const { error } = await supabase
          .from("investment_assets")
          .insert({
            user_id: user.id,
            name: data.name,
            symbol: data.symbol,
            instrument_id: data.instrument_id,
          });

        if (error) throw error;
        toast({ title: "Aset berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan aset",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

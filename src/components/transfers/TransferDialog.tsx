
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/queries/useWallets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransferFormData {
  from_wallet_id: string;
  to_wallet_id: string;
  amount_from: number;
  amount_to: number;
  date: string;
}

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: any;
  onSuccess?: () => void;
}

const TransferDialog = ({ open, onOpenChange, transfer, onSuccess }: TransferDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TransferFormData>({
    defaultValues: {
      from_wallet_id: transfer?.from_wallet_id?.toString() || "",
      to_wallet_id: transfer?.to_wallet_id?.toString() || "",
      amount_from: transfer?.amount_from || 0,
      amount_to: transfer?.amount_to || 0,
      date: transfer?.date || new Date().toISOString().split('T')[0],
    },
  });

  const { data: wallets } = useWallets();

  const fromWalletId = form.watch("from_wallet_id");
  const toWalletId = form.watch("to_wallet_id");
  const amountFrom = form.watch("amount_from");

  const fromWallet = wallets?.find(w => w.id.toString() === fromWalletId);
  const toWallet = wallets?.find(w => w.id.toString() === toWalletId);
  const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;

  // Auto-populate amount_to when same currency
  useEffect(() => {
    if (isSameCurrency && amountFrom > 0) {
      form.setValue("amount_to", amountFrom);
    }
  }, [isSameCurrency, amountFrom, form]);

  const onSubmit = async (data: TransferFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    const transferData = {
      from_wallet_id: parseInt(data.from_wallet_id),
      to_wallet_id: parseInt(data.to_wallet_id),
      amount_from: data.amount_from,
      amount_to: isSameCurrency ? data.amount_from : data.amount_to,
      currency_from: fromWallet.currency_code,
      currency_to: toWallet.currency_code,
      date: data.date,
    };
    try {
      if (transfer) {
        // Update existing transfer
        const { error } = await supabase
          .from("transfers")
          .update({
            ...transferData,
          })
          .eq("id", transfer.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Transfer berhasil diperbarui" });
      } else {
        // Create new transfer
        const { error } = await supabase
          .from("transfers")
          .insert({
            user_id: user.id,
            ...transferData,
          });

        if (error) throw error;
        toast({ title: "Transfer berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving transfer:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan transfer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when transfer prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (transfer) {
        form.reset({
          from_wallet_id: transfer.from_wallet_id || "",
          to_wallet_id: transfer.to_wallet_id || "",
          amount_from: transfer.amount_from || 0,
          amount_to: isSameCurrency ? transfer.amount_from : transfer.amount_to || 0,
          date: transfer.date || "",
        });
      } else {
        form.reset({
          from_wallet_id: "",
          to_wallet_id: "",
          amount_from: 0,
          amount_to: 0,
          date: "",
        });
      }
    }
  }, [transfer, open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transfer ? "Edit Transfer" : "Tambah Transfer Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_wallet_id"
                rules={{ required: "Dompet asal harus dipilih" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dari Dompet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dompet asal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {wallet.name} ({wallet.currency_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_wallet_id"
                rules={{ required: "Dompet tujuan harus dipilih" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ke Dompet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dompet tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {wallet.name} ({wallet.currency_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount_from"
                rules={{ required: "Jumlah keluar harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Keluar</FormLabel>
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
                name="amount_to"
                rules={{ required: "Jumlah masuk harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Masuk</FormLabel>
                    <FormControl>
                      <InputNumber 
                        {...field} 
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                        disabled={isSameCurrency}
                      />
                    </FormControl>
                    {isSameCurrency && (
                      <p className="text-xs text-muted-foreground">
                        Otomatis sama dengan jumlah keluar (mata uang sama)
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fromWallet && toWallet && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                Transfer dari {fromWallet.name} ({fromWallet.currency_code}) ke {toWallet.name} ({toWallet.currency_code})
              </div>
            )}

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
                {isLoading ? "Menyimpan..." : transfer ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;

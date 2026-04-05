import { useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { WalletDropdown } from "@/components/ui/dropdowns";
import { TransferFormData } from "@/form-dto/transfer";
import { TransferModel } from "@/models/transfer";
import { WalletModel } from "@/models/wallets";
import { UseFormReturn } from "react-hook-form";
import { ArrowLeftRight } from "lucide-react";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TransferFormData>;
  isLoading: boolean;
  onSubmit: (data: TransferFormData) => void;
  wallets?: WalletModel[];
  transfer?: TransferModel;
}

const TransferDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  wallets,
  transfer
}: TransferDialogProps) => {
  const watchFromId = form.watch("from_wallet_id");
  const watchToId = form.watch("to_wallet_id");
  const watchAmountFrom = form.watch("from_amount");

  const fromWallet = useMemo(
    () => wallets?.find(w => w.id.toString() === watchFromId?.toString()),
    [wallets, watchFromId]
  );
  const toWallet = useMemo(
    () => wallets?.find(w => w.id.toString() === watchToId?.toString()),
    [wallets, watchToId]
  );
  const isSameCurrency = fromWallet && toWallet && fromWallet.currency_code === toWallet.currency_code;

  useEffect(() => {
    if (isSameCurrency && watchAmountFrom > 0) {
      form.setValue("to_amount", watchAmountFrom);
    }
  }, [isSameCurrency, watchAmountFrom, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-0">
        <div className="border-b">
          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          <div className="px-6 pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {transfer ? "Ubah Transfer" : "Tambah Transfer"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {transfer ? "Perbarui data transfer antar dompet" : "Catat perpindahan dana antar dompet"}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <WalletDropdown
                  control={form.control}
                  name="from_wallet_id"
                  wallets={wallets}
                  label="Dari Dompet"
                  rules={{ required: "Dompet asal harus dipilih" }}
                />

                <WalletDropdown
                  control={form.control}
                  name="to_wallet_id"
                  wallets={wallets}
                  label="Ke Dompet"
                  rules={{ required: "Dompet tujuan harus dipilih" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="from_amount"
                  rules={{ required: "Jumlah keluar harus diisi", min: { value: 0, message: "Harus lebih dari 0" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Keluar</FormLabel>
                      <FormControl>
                        <InputNumber {...field} onChange={field.onChange} value={field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="to_amount"
                  rules={{ required: "Jumlah masuk harus diisi", min: { value: 0, message: "Harus lebih dari 0" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Masuk</FormLabel>
                      <FormControl>
                        <InputNumber {...field} onChange={field.onChange} value={field.value} disabled={isSameCurrency} />
                      </FormControl>
                      {isSameCurrency && (
                        <p className="text-xs text-muted-foreground">Otomatis disamakan karena mata uang sama</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {fromWallet && toWallet && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Transfer dari <b>{fromWallet.name}</b> ({fromWallet.currency_code}) ke <b>{toWallet.name}</b> ({toWallet.currency_code})
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

              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : transfer ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;

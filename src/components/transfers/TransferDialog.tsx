import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useWallets } from "@/hooks/queries/use-wallets";
import { Dropdown } from "@/components/ui/dropdown";
import { defaultTransferFormData, TransferFormData } from "@/form-dto/transfer";
import { useCreateTransfer, useUpdateTransfer } from "@/hooks/queries/use-transfers";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { TransferModel } from "@/models/transfer";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: TransferModel;
  onSuccess?: () => void;
}

const TransferDialog = ({ open, onOpenChange, transfer, onSuccess }: TransferDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { data: wallets } = useWallets();
  const updateTransfer = useUpdateTransfer();
  const createTransfer = useCreateTransfer();

  const form = useForm<TransferFormData>({
    defaultValues: defaultTransferFormData,
  });

  const watchFromId = form.watch("from_wallet_id");
  const watchToId = form.watch("to_wallet_id");
  const watchAmountFrom = form.watch("from_amount");

  const fromWallet = useMemo(
    () => wallets?.find(w => w.id.toString() === watchFromId),
    [wallets, watchFromId]
  );
  const toWallet = useMemo(
    () => wallets?.find(w => w.id.toString() === watchToId),
    [wallets, watchToId]
  );
  const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;

  // Reset form values when dialog opens and wallets ready
  useEffect(() => {
    if (!open || !wallets) return;

    if (transfer) {
      form.reset({
        from_wallet_id: transfer.from_wallet_id?.toString() || null,
        to_wallet_id: transfer.to_wallet_id?.toString() || null,
        from_amount: transfer.from_amount || 0,
        to_amount: transfer.to_amount || 0,
        date: transfer.date || new Date().toISOString().split("T")[0],
      });
    } else {
      form.reset(defaultTransferFormData);
    }
  }, [open, wallets, transfer, form]);

  // Sync to_amount if currency same
  useEffect(() => {
    if (isSameCurrency && watchAmountFrom > 0) {
      form.setValue("to_amount", watchAmountFrom);
    }
  }, [isSameCurrency, watchAmountFrom, form]);

  // Use mutation callbacks utility
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading,
    onOpenChange,
    onSuccess,
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSFERS
  });

  const onSubmit = async (data: TransferFormData) => {
    if (!user) return;

    setIsLoading(true);

    const transferData = {
      from_wallet_id: parseInt(data.from_wallet_id || "0"),
      to_wallet_id: parseInt(data.to_wallet_id || "0"),
      from_amount: data.from_amount,
      to_amount: isSameCurrency ? data.from_amount : data.to_amount,
      date: data.date,
    };

    if (transfer) {
      updateTransfer.mutate({ id: transfer.id, ...transferData }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createTransfer.mutate(transferData, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transfer ? "Ubah Transfer" : "Tambah Transfer"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                control={form.control}
                name="from_wallet_id"
                label="Dari Dompet"
                placeholder="Pilih dompet"
                rules={{ required: "Dompet asal harus dipilih" }}
                options={[
                  { value: "none", label: "Pilih dompet" },
                  ...(wallets?.map(wallet => ({
                    value: wallet.id.toString(),
                    label: `${wallet.name} (${wallet.currency_code})`
                  })) || [])
                ]}
                onValueChange={(value) => form.setValue("from_wallet_id", value === "none" ? null : value)}
              />

              <Dropdown
                control={form.control}
                name="to_wallet_id"
                label="Ke Dompet"
                placeholder="Pilih dompet"
                rules={{ required: "Dompet tujuan harus dipilih" }}
                options={[
                  { value: "none", label: "Pilih dompet" },
                  ...(wallets?.map(wallet => ({
                    value: wallet.id.toString(),
                    label: `${wallet.name} (${wallet.currency_code})`
                  })) || [])
                ]}
                onValueChange={(value) => form.setValue("to_wallet_id", value === "none" ? null : value)}
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
                      <InputNumber
                        {...field}
                        onChange={field.onChange}
                        value={field.value}
                        disabled={isSameCurrency}
                      />
                    </FormControl>
                    {isSameCurrency && (
                      <p className="text-xs text-muted-foreground">
                        Otomatis disamakan dengan jumlah keluar karena mata uang sama
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fromWallet && toWallet && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                Transfer dari <b>{fromWallet.name}</b> ({fromWallet.currency_code}) ke{" "}
                <b>{toWallet.name}</b> ({toWallet.currency_code})
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
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : transfer ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;

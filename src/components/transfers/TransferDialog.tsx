import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useWallets } from "@/hooks/queries/use-wallets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultTransferFormData, TransferFormData } from "@/form-dto/transfer";
import { useCreateTransfer, useUpdateTransfer } from "@/hooks/queries/use-transfers";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: any;
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
        from_wallet_id: transfer.from_wallet_id?.toString() || "",
        to_wallet_id: transfer.to_wallet_id?.toString() || "",
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
      from_wallet_id: parseInt(data.from_wallet_id),
      to_wallet_id: parseInt(data.to_wallet_id),
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
          <DialogTitle>{transfer ? "Edit Transfer" : "Tambah Transfer"}</DialogTitle>
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
                    <Controller
                      control={form.control}
                      name="from_wallet_id"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih dompet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets?.map(wallet => (
                              <SelectItem key={wallet.id} value={wallet.id.toString()}>
                                {wallet.name} ({wallet.currency_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
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
                    <Controller
                      control={form.control}
                      name="to_wallet_id"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih dompet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets?.map(wallet => (
                              <SelectItem key={wallet.id} value={wallet.id.toString()}>
                                {wallet.name} ({wallet.currency_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_amount"
                rules={{ required: "Jumlah keluar harus diisi", min: { value: 1, message: "Harus lebih dari 0" } }}
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
                rules={{ required: "Jumlah masuk harus diisi", min: { value: 1, message: "Harus lebih dari 0" } }}
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

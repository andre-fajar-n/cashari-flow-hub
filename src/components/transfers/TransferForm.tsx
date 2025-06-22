
import { useForm } from "react-hook-form";
import { useCreateTransfer, useUpdateTransfer } from "@/hooks/queries/useTransfers";
import { useWallets } from "@/hooks/queries/useWallets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface TransferFormData {
  from_wallet_id: string;
  to_wallet_id: string;
  amount_from: number;
  amount_to: number;
  date: string;
}

interface TransferFormProps {
  onSuccess?: () => void;
  editData?: any;
}

const TransferForm = ({ onSuccess, editData }: TransferFormProps) => {
  const form = useForm<TransferFormData>({
    defaultValues: {
      from_wallet_id: editData?.from_wallet_id?.toString() || "",
      to_wallet_id: editData?.to_wallet_id?.toString() || "",
      amount_from: editData?.amount_from || 0,
      amount_to: editData?.amount_to || 0,
      date: editData?.date || new Date().toISOString().split('T')[0],
    },
  });

  const { mutate: createTransfer, isPending: isCreating } = useCreateTransfer();
  const { mutate: updateTransfer, isPending: isUpdating } = useUpdateTransfer();
  const { data: wallets } = useWallets();

  const isPending = isCreating || isUpdating;
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

  const onSubmit = (data: TransferFormData) => {
    if (data.from_wallet_id === data.to_wallet_id) {
      toast({
        title: "Error",
        description: "Dompet asal dan tujuan tidak boleh sama",
        variant: "destructive",
      });
      return;
    }

    if (!fromWallet || !toWallet) {
      toast({
        title: "Error",
        description: "Pilih kedua dompet terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const transferData = {
      from_wallet_id: parseInt(data.from_wallet_id),
      to_wallet_id: parseInt(data.to_wallet_id),
      amount_from: data.amount_from,
      amount_to: isSameCurrency ? data.amount_from : data.amount_to,
      currency_from: fromWallet.currency_code,
      currency_to: toWallet.currency_code,
      date: data.date,
    };

    if (editData) {
      updateTransfer({
        id: editData.id,
        ...transferData,
      }, {
        onSuccess: () => {
          toast({
            title: "Berhasil",
            description: "Transfer berhasil diperbarui",
          });
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } else {
      createTransfer(transferData, {
        onSuccess: () => {
          toast({
            title: "Berhasil",
            description: "Transfer berhasil dilakukan",
          });
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="from_wallet_id"
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

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (editData ? "Memperbarui..." : "Memproses...") : (editData ? "Perbarui Transfer" : "Transfer")}
        </Button>
      </form>
    </Form>
  );
};

export default TransferForm;

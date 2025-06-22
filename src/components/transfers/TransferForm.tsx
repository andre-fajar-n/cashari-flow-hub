
import { useForm } from "react-hook-form";
import { useCreateTransfer } from "@/hooks/queries/useTransfers";
import { useWallets } from "@/hooks/queries/useWallets";
import { useCurrencies } from "@/hooks/queries/useCurrencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

interface TransferFormData {
  from_wallet_id: string;
  to_wallet_id: string;
  amount_from: number;
  amount_to: number;
  currency_from: string;
  currency_to: string;
  date: string;
}

interface TransferFormProps {
  onSuccess?: () => void;
}

const TransferForm = ({ onSuccess }: TransferFormProps) => {
  const form = useForm<TransferFormData>({
    defaultValues: {
      amount_from: 0,
      amount_to: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const { mutate: createTransfer, isPending } = useCreateTransfer();
  const { data: wallets } = useWallets();
  const { data: currencies } = useCurrencies();

  const onSubmit = (data: TransferFormData) => {
    if (data.from_wallet_id === data.to_wallet_id) {
      toast({
        title: "Error",
        description: "Dompet asal dan tujuan tidak boleh sama",
        variant: "destructive",
      });
      return;
    }

    createTransfer({
      from_wallet_id: parseInt(data.from_wallet_id),
      to_wallet_id: parseInt(data.to_wallet_id),
      amount_from: data.amount_from,
      amount_to: data.amount_to,
      currency_from: data.currency_from,
      currency_to: data.currency_to,
      date: data.date,
    }, {
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
                        {wallet.name}
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
                        {wallet.name}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currency_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mata Uang Asal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies?.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
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
            name="currency_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mata Uang Tujuan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies?.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          {isPending ? "Memproses..." : "Transfer"}
        </Button>
      </form>
    </Form>
  );
};

export default TransferForm;

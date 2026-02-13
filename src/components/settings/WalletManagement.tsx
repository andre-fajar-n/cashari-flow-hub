import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { CurrencyDropdown } from "@/components/ui/dropdowns";
import { useForm } from "react-hook-form";
import { Plus, Trash, Pen } from "lucide-react";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useCreateWallet, useDeleteWallet, useUpdateWallet, useWallets } from "@/hooks/queries/use-wallets";
import { defaultWalletFormValues, WalletFormData } from "@/form-dto/wallets";
import { WalletModel } from "@/models/wallets";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { Badge } from "@/components/ui/badge";
import { CurrencyModel } from "@/models/currencies";

const WalletManagement = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletModel | null>(null);
  const { data: wallets, isLoading } = useWallets();
  const { data: currencies } = useCurrencies();
  const deleteMutation = useDeleteWallet();
  const createMutation = useCreateWallet();
  const updateMutation = useUpdateWallet();

  const form = useForm<WalletFormData>({
    defaultValues: defaultWalletFormValues,
  });

  const currencyMap = currencies?.reduce((acc, currency) => {
    acc[currency.code] = currency;
    return acc;
  }, {} as Record<string, CurrencyModel>);

  // Reset form when adding/editing state changes
  useEffect(() => {
    if (isAdding) {
      form.reset(defaultWalletFormValues);
    }
  }, [isAdding, form]);

  useEffect(() => {
    if (editingWallet) {
      form.reset({
        name: editingWallet.name,
        currency_code: editingWallet.currency_code || null,
        initial_amount: editingWallet.initial_amount,
      });
    }
  }, [editingWallet, form]);

  // Use mutation callbacks utility
  const { handleSuccess } = useMutationCallbacks({
    setIsLoading: () => { }, // Not used in this component
    onOpenChange: () => {
      setIsAdding(false);
      setEditingWallet(null);
    },
    onSuccess: () => { },
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.WALLETS
  });

  const onSubmit = (data: WalletFormData) => {
    if (editingWallet) {
      updateMutation.mutate({ id: editingWallet.id, ...data }, {
        onSuccess: handleSuccess
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: handleSuccess
      });
    }
  };

  const startEdit = (wallet: WalletModel) => {
    setEditingWallet(wallet);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingWallet(null);
    form.reset(defaultWalletFormValues);
  };

  const columnFilters: ColumnFilter[] = [
    {
      field: "currency_code",
      label: "Mata Uang",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})${currency.type ? ` [${currency.type}]` : ''}`,
        value: currency.code
      })) || []
    },
    {
      field: "balance",
      label: "Saldo Min",
      type: "number"
    }
  ];

  const renderWalletItem = (wallet: WalletModel) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{wallet.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">Nama Dompet</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{wallet.currency_code}</p>
            {currencyMap?.[wallet.currency_code]?.type && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 capitalize font-normal">
                {currencyMap?.[wallet.currency_code]?.type}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Mata Uang</p>
        </div>
        <div>
          <p className="font-medium">{wallet.initial_amount.toLocaleString('id-ID')}</p>
          <p className="text-sm text-muted-foreground">Saldo Awal</p>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => startEdit(wallet)}
          disabled={editingWallet?.id === wallet.id}
        >
          <Pen className="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteMutation.mutate(wallet.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isAdding || editingWallet ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingWallet ? "Edit Dompet" : "Tambah Dompet Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Dompet</FormLabel>
                        <FormControl>
                          <Input placeholder="Dompet Utama" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CurrencyDropdown
                    control={form.control}
                    name="currency_code"
                    label="Mata Uang"
                    currencies={currencies || []}
                  />
                  <FormField
                    control={form.control}
                    name="initial_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Awal</FormLabel>
                        <FormControl>
                          <InputNumber {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingWallet ? "Update" : "Simpan"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={wallets || []}
          isLoading={isLoading}
          searchPlaceholder="Cari dompet berdasarkan nama atau mata uang..."
          searchFields={['name', 'currency_code']}
          columnFilters={columnFilters}
          itemsPerPage={10}
          renderItem={renderWalletItem}
          emptyStateMessage="Belum ada dompet yang dibuat"
          title="Kelola Dompet"
          headerActions={
            !isAdding && !editingWallet && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Dompet
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default WalletManagement;

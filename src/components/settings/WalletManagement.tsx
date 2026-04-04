import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { CurrencyDropdown } from "@/components/ui/dropdowns";
import { useForm } from "react-hook-form";
import { Plus, Trash, Pen, Wallet } from "lucide-react";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useCreateWallet, useDeleteWallet, useUpdateWallet, useWallets } from "@/hooks/queries/use-wallets";
import { defaultWalletFormValues, WalletFormData } from "@/form-dto/wallets";
import { WalletModel } from "@/models/wallets";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
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
    const submitData = {
      ...data,
    };

    if (editingWallet) {
      updateMutation.mutate({ id: editingWallet.id, ...submitData }, {
        onSuccess: handleSuccess
      });
    } else {
      createMutation.mutate(submitData, {
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

  const renderWalletItem = (wallet: WalletModel) => {
    const currencyType = currencyMap?.[wallet.currency_code]?.type;
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 min-w-0">
            <div>
              <p className="font-medium text-foreground truncate">{wallet.name}</p>
              <p className="text-xs text-muted-foreground">Nama Dompet</p>
            </div>
            <div>
              <p className="font-medium">{wallet.currency_code}</p>
              <p className="text-xs text-muted-foreground">Mata Uang</p>
            </div>
            <div>
              {currencyType ? (
                <Badge variant="outline" className="text-xs capitalize">{currencyType}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tipe</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startEdit(wallet)}
            disabled={editingWallet?.id === wallet.id}
            className="h-8 w-8 p-0"
          >
            <Pen className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate(wallet.id)}
            disabled={deleteMutation.isPending}
            className="h-8 w-8 p-0"
          >
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {isAdding || editingWallet ? (
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base">
              {editingWallet ? "Edit Dompet" : "Tambah Dompet Baru"}
            </CardTitle>
          </div>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="flex gap-2 pt-2 border-t">
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
          useUrlParams={false}
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

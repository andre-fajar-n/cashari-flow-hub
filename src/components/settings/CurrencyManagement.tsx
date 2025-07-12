
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, FilterOption } from "@/components/ui/data-table";
import { Plus, Edit, Star, Trash } from "lucide-react";
import CurrencyForm from "@/components/settings/CurrencyForm";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCreateCurrency, useCurrencies, useDeleteCurrency, useSetDefaultCurrency, useUpdateCurrency } from "@/hooks/queries";
import { CurrencyModel } from "@/models/currencies";
import { CurrencyFormData, defaultCurrencyFormValues } from "@/form-dto/currencies";
import { useForm } from "react-hook-form";

const CurrencyManagement = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyModel | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);
  const { data: currencies, isLoading } = useCurrencies();
  const deleteCurrency = useDeleteCurrency();
  const createCurrency = useCreateCurrency();
  const updateCurrency = useUpdateCurrency();
  const setDefaultMutation = useSetDefaultCurrency();

  const form = useForm<CurrencyFormData>({
    defaultValues: defaultCurrencyFormValues,
  });

  // Reset form when adding/editing state changes
  useEffect(() => {
    if (isAdding) {
      form.reset({
        name: "",
        symbol: "",
        code: "",
      });
    }
  }, [isAdding, form]);

  useEffect(() => {
    if (editingCurrency) {
      form.reset({
        name: editingCurrency.name,
        symbol: editingCurrency.symbol,
        code: editingCurrency.code,
      });
    }
  }, [editingCurrency, form]);

  const onSubmit = (data: CurrencyFormData) => {
    if (editingCurrency) {
      updateCurrency.mutate({ ...data, originalCode: editingCurrency.code });
    } else {
      createCurrency.mutate(data);
    }
  };

  const startEdit = (currency: CurrencyModel) => {
    setEditingCurrency(currency);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingCurrency(null);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setIsAdding(true);
  };

  useEffect(() => {
    if (createCurrency.isSuccess || updateCurrency.isSuccess) {
      setEditingCurrency(null);
      setIsAdding(false);
    }
  }, [createCurrency.isSuccess, updateCurrency.isSuccess]);

  const handleDeleteClick = (currencyCode: string) => {
    setCurrencyToDelete(currencyCode);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currencyToDelete) {
      deleteCurrency.mutate(currencyToDelete);
      setIsDeleteModalOpen(false);
      setCurrencyToDelete(null);
    }
  };

  // Filter options for DataTable
  const filterOptions: FilterOption[] = [
    {
      label: "Default",
      value: "default",
      filterFn: (currency: CurrencyModel) => currency.is_default
    },
    {
      label: "Non-Default",
      value: "non-default",
      filterFn: (currency: CurrencyModel) => !currency.is_default
    }
  ];

  const renderCurrencyItem = (currency: CurrencyModel) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="font-medium">{currency.code}</p>
          <p className="text-sm text-muted-foreground">Kode</p>
        </div>
        <div>
          <p className="font-medium">{currency.name}</p>
          <p className="text-sm text-muted-foreground">Nama</p>
        </div>
        <div>
          <p className="font-medium">{currency.symbol}</p>
          <p className="text-sm text-muted-foreground">Symbol</p>
        </div>
        <div>
          {currency.is_default ? (
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">Default</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDefaultMutation.mutate(currency.code)}
              disabled={setDefaultMutation.isPending}
              className="h-8 px-3 text-xs"
            >
              <Star className="w-3 h-3 mr-1" />
              Set Default
            </Button>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => startEdit(currency)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        {!currency.is_default && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(currency.code)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Mata Uang"
        description="Apakah Anda yakin ingin menghapus mata uang ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingCurrency ? "Edit Mata Uang" : "Tambah Mata Uang Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyForm
              form={form}
              editingCurrency={editingCurrency}
              onSubmit={onSubmit}
              onCancel={cancelEdit}
              isLoading={createCurrency.isPending || updateCurrency.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={currencies || []}
          isLoading={isLoading}
          searchPlaceholder="Cari mata uang berdasarkan kode, nama, atau symbol..."
          searchFields={['code', 'name', 'symbol']}
          filterOptions={filterOptions}
          itemsPerPage={10}
          renderItem={renderCurrencyItem}
          emptyStateMessage="Belum ada mata uang yang dibuat"
          title="Kelola Mata Uang"
          headerActions={
            !isAdding && (
              <Button onClick={handleAddNew} disabled={isAdding} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Mata Uang
              </Button>
            )
          }
        />
      )}

    </div>
  );
};

export default CurrencyManagement;

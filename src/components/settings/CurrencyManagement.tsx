
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import CurrencyForm from "./CurrencyForm";
import CurrencyTable from "./CurrencyTable";
import { useCreateCurrency, useCurrencies, useDeleteCurrency, useSetDefaultCurrency, useUpdateCurrency } from "@/hooks/queries";
import { CurrencyModel } from "@/models/currencies";
import { CurrencyFormData, defaultCurrencyFormValues } from "@/form-dto/currencies";
import { useForm } from "react-hook-form";

const CurrencyManagement = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyModel | null>(null);
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

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Kelola Mata Uang</CardTitle>
        {!isAdding && (
          <Button onClick={handleAddNew} disabled={isAdding} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Mata Uang
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding ? (
          <CurrencyForm
            form={form}
            editingCurrency={editingCurrency}
            onSubmit={onSubmit}
            onCancel={cancelEdit}
            isLoading={createCurrency.isPending || updateCurrency.isPending}
          />
        ) : (
          <CurrencyTable
            currencies={currencies}
            onEdit={startEdit}
            onSetDefault={(currencyCode) => setDefaultMutation.mutate(currencyCode)}
            onDelete={(currencyCode) => deleteCurrency.mutate(currencyCode)}
            setDefaultLoading={setDefaultMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyManagement;

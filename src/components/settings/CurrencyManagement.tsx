
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import CurrencyForm from "./CurrencyForm";
import CurrencyTable from "./CurrencyTable";
import { useCurrencyOperations } from "@/hooks/useCurrencyOperations";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
}

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
}

const CurrencyManagement = () => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const { createMutation, updateMutation, setDefaultMutation, deleteMutation } = useCurrencyOperations();

  const { data: currencies, isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      return data as Currency[];
    },
    enabled: !!user,
  });

  const onSubmit = (data: CurrencyFormData) => {
    if (editingCurrency) {
      updateMutation.mutate({ ...data, originalCode: editingCurrency.code });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingCurrency(null);
    setIsAdding(false);
  };

  const handleMutationSuccess = () => {
    setEditingCurrency(null);
    setIsAdding(false);
  };

  // Listen for successful mutations to reset form state
  if (createMutation.isSuccess || updateMutation.isSuccess) {
    setTimeout(handleMutationSuccess, 0);
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Kelola Mata Uang</CardTitle>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} disabled={isAdding} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Mata Uang
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding ? (
          <CurrencyForm
            editingCurrency={editingCurrency}
            onSubmit={onSubmit}
            onCancel={cancelEdit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        ) : (
          <CurrencyTable
            currencies={currencies}
            onEdit={startEdit}
            onSetDefault={(currencyCode) => setDefaultMutation.mutate(currencyCode)}
            onDelete={(currencyCode) => deleteMutation.mutate(currencyCode)}
            setDefaultLoading={setDefaultMutation.isPending}
            deleteLoading={deleteMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyManagement;

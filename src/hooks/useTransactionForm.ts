
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  date: string;
  description?: string;
  debt_id?: string;
  budget_id?: string;
  business_project_id?: string;
}

const getDefaultValues = (transaction?: any): TransactionFormData => ({
  amount: transaction?.amount || 0,
  category_id: transaction?.category_id?.toString() || "",
  wallet_id: transaction?.wallet_id?.toString() || "",
  date: transaction?.date || new Date().toISOString().split('T')[0],
  description: transaction?.description || "",
  debt_id: "none",
  budget_id: "none",
  business_project_id: "none",
});

export const useTransactionForm = (transaction?: any, open?: boolean) => {
  const form = useForm<TransactionFormData>({
    defaultValues: getDefaultValues(transaction),
  });

  // Reset form when dialog opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      const newValues = getDefaultValues(transaction);
      form.reset(newValues);
    }
  }, [transaction, open, form]);

  return { form, defaultValues: getDefaultValues(transaction) };
};

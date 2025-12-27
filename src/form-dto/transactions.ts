import { TransactionModel } from "@/models/transactions";

export interface TransactionFormData {
  amount: number;
  category_id: string | null;
  wallet_id: string | null;
  date: string;
  description: string | null;
  budget_ids: number[];
  business_project_ids: number[];
}

export const defaultTransactionFormValues: TransactionFormData = {
  amount: 0,
  category_id: null,
  wallet_id: null,
  date: new Date().toISOString().split("T")[0],
  description: "",
  budget_ids: [],
  business_project_ids: [],
};

export const mapTransactionToFormData = (transaction: TransactionModel): Partial<TransactionFormData> => {
  const budgetIds = transaction.budget_items?.map((item) => item.budget_id) || [];
  const businessProjectIds = transaction.business_project_transactions?.map((item) => item.project_id) || [];
  return {
    amount: transaction.amount || 0,
    category_id: transaction.category_id ? transaction.category_id.toString() : null,
    wallet_id: transaction.wallet_id ? transaction.wallet_id.toString() : null,
    date: transaction.date || new Date().toISOString().split("T")[0],
    description: transaction.description || "",
    budget_ids: budgetIds,
    business_project_ids: businessProjectIds,
  };
};

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  ids?: number[];
}

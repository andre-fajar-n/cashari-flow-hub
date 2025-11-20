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

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  ids?: number[];
}

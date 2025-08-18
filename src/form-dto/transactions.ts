export interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  date: string;
  description: string | null;
  budget_ids: number[];
  business_project_ids: number[];
}

export const defaultTransactionFormValues: TransactionFormData = {
  amount: 0,
  category_id: "",
  wallet_id: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  budget_ids: [],
  business_project_ids: [],
};

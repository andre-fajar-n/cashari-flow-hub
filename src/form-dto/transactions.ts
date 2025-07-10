export interface TransactionFormData {
  amount: number;
  category_id: number;
  wallet_id: number;
  date: string;
  currency_code: string;
  description: string | null;
  budget_ids: number[];
  business_project_ids: number[];
}

export const defaultTransactionFormValues: TransactionFormData = {
  amount: 0,
  category_id: 0,
  wallet_id: 0,
  date: new Date().toISOString().split("T")[0],
  currency_code: "IDR",
  description: "",
  budget_ids: [],
  business_project_ids: [],
};

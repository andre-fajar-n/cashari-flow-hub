export interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  date: string;
  description?: string;
  debt_id?: string;
  budget_id?: string;
  business_project_id?: string;
}

export const defaultTransactionFormValues: TransactionFormData = {
  amount: 0,
  category_id: "",
  wallet_id: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  debt_id: "none",
  budget_id: "none",
  business_project_id: "none",
};

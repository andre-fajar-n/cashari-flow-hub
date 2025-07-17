export interface DebtHistoryFormData {
  debt_id: number;
  wallet_id: string;
  category_id: string;
  amount: number;
  currency_code: string;
  date: string;
  description?: string;
  exchange_rate?: number;
}

export const defaultDebtHistoryFormValues: DebtHistoryFormData = {
  debt_id: 0,
  wallet_id: "",
  category_id: "",
  amount: 0,
  currency_code: "IDR",
  date: new Date().toISOString().split("T")[0],
  description: "",
  exchange_rate: 1,
};

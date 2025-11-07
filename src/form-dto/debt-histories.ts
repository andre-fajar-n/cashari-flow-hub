export interface DebtHistoryFormData {
  debt_id: number;
  wallet_id: string;
  category_id: string;
  amount: number;
  date: string;
  description?: string;
}

export const defaultDebtHistoryFormValues: DebtHistoryFormData = {
  debt_id: 0,
  wallet_id: "",
  category_id: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  description: "",
};

export interface DebtHistoryFilter {
  debtId?: number;
  ids?: number[];
}

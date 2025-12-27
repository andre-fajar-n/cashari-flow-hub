import { DebtHistoryModel } from "@/models/debt-histories";

export interface DebtHistoryFormData {
  debt_id: string;
  wallet_id: string;
  category_id: string;
  amount: number;
  date: string;
  description?: string;
}

export interface DebtHistorySubmitData {
  debt_id: number;
  wallet_id: number;
  category_id: number;
  amount: number;
  date: string;
  description?: string;
}

export const defaultDebtHistoryFormValues: DebtHistoryFormData = {
  debt_id: "",
  wallet_id: "",
  category_id: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  description: "",
};

export const mapDebtHistoryToFormData = (history: DebtHistoryModel): DebtHistoryFormData => ({
  debt_id: history.debt_id.toString(),
  wallet_id: history.wallet_id.toString(),
  category_id: history.category_id.toString(),
  amount: history.amount,
  date: history.date,
  description: history.description || "",
});

export interface DebtHistoryFilter {
  debtId?: number;
  ids?: number[];
}

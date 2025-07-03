export interface BudgetFormData {
  name: string;
  amount: number;
  currency_code: string;
  start_date: string;
  end_date: string;
}

export const defaultBudgetFormValues: BudgetFormData = {
  name: "",
  amount: 0,
  currency_code: "IDR",
  start_date: "",
  end_date: "",
};

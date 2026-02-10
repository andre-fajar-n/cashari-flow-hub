import { BudgetModel } from "@/models/budgets";

export interface BudgetFormData {
  name: string;
  amount: number;
  start_date: string;
  end_date: string;
}

export const defaultBudgetFormValues: BudgetFormData = {
  name: "",
  amount: 0,
  start_date: "",
  end_date: "",
};

export const mapBudgetToFormData = (budget: BudgetModel): BudgetFormData => ({
  name: budget.name || "",
  amount: budget.amount || 0,
  start_date: budget.start_date || "",
  end_date: budget.end_date || "",
});

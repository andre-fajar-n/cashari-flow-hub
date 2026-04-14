import { BudgetModel } from "@/models/budgets";

export type BudgetType = "kustom" | "bulanan" | "tahunan";
export type RolloverType = "none" | "add_remaining" | "full";

export interface BudgetFormData {
  name: string;
  amount: number;
  budget_type: BudgetType;
  rollover_type: RolloverType;
  start_date: string;
  end_date: string | null;
  currency_code: string;
  category_ids: number[];
}

export const defaultBudgetFormValues: BudgetFormData = {
  name: "",
  amount: 0,
  budget_type: "kustom",
  rollover_type: "none",
  start_date: "",
  end_date: "",
  currency_code: "IDR",
  category_ids: [],
};

export const mapBudgetToFormData = (budget: BudgetModel): BudgetFormData => ({
  name: budget.name || "",
  amount: budget.amount || 0,
  budget_type: (budget.budget_type as BudgetType) || "kustom",
  rollover_type: (budget.rollover_type as RolloverType) || "none",
  start_date: budget.start_date || "",
  end_date: budget.end_date || "",
  currency_code: budget.currency_code || "IDR",
  category_ids: [],
});

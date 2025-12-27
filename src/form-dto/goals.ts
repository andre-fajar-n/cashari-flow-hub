import { GoalModel } from "@/models/goals";

export interface GoalFormData {
  name: string;
  target_amount: number;
  currency_code: string;
  target_date: string;
}

export const defaultGoalFormValues: GoalFormData = {
  name: "",
  target_amount: 0,
  currency_code: "IDR",
  target_date: "",
};

export const mapGoalToFormData = (goal: GoalModel): GoalFormData => ({
  name: goal.name || "",
  target_amount: goal.target_amount || 0,
  currency_code: goal.currency_code || "",
  target_date: goal.target_date || "",
});

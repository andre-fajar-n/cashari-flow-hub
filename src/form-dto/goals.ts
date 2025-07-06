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

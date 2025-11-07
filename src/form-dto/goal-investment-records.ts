
export interface GoalInvestmentRecordFormData {
  goal_id: number;
  instrument_id: number;
  asset_id: number;
  wallet_id: number;
  category_id: number;
  amount: number;
  amount_unit: number | null;
  date: string;
  description: string;
  is_valuation: boolean;
}

export const defaultGoalInvestmentRecordFormData: GoalInvestmentRecordFormData = {
  goal_id: 0,
  instrument_id: 0,
  asset_id: 0,
  wallet_id: 0,
  category_id: 0,
  amount: 0,
  amount_unit: null,
  date: new Date().toISOString().split("T")[0],
  description: "",
  is_valuation: false,
};

export interface GoalInvestmentRecordFilter {
  ids?: number[];
  goalId?: number;
  assetId?: number;
}

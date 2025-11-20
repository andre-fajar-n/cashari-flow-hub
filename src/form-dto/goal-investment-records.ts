
export interface GoalInvestmentRecordFormData {
  goal_id: number | null;
  instrument_id: number | null;
  asset_id: number | null;
  wallet_id: number | null;
  category_id: number | null;
  amount: number;
  amount_unit: number | null;
  date: string;
  description: string;
  is_valuation: boolean;
}

export const defaultGoalInvestmentRecordFormData: GoalInvestmentRecordFormData = {
  goal_id: null,
  instrument_id: null,
  asset_id: null,
  wallet_id: null,
  category_id: null,
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

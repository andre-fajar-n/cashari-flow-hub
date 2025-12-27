import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";

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

export const mapGoalInvestmentRecordToFormData = (
  record: GoalInvestmentRecordModel,
  instrumentId?: number | null,
  assetId?: number | null
): GoalInvestmentRecordFormData => ({
  goal_id: record.goal_id,
  instrument_id: instrumentId || record.instrument_id || null,
  asset_id: assetId || record.asset_id || null,
  wallet_id: record.wallet_id,
  category_id: record.category_id,
  amount: record.amount,
  amount_unit: record.amount_unit,
  date: record.date,
  description: record.description || "",
  is_valuation: record.is_valuation || false,
});

export interface GoalInvestmentRecordFilter {
  ids?: number[];
  goalId?: number;
  assetId?: number;
}

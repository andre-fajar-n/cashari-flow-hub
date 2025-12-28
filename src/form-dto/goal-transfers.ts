import { GoalTransferModel } from "@/models/goal-transfers";

export interface GoalTransferFormData {
  from_wallet_id: number | null;
  from_goal_id: number | null;
  from_instrument_id: number | null;
  from_asset_id: number | null;
  to_wallet_id: number | null;
  to_goal_id: number | null;
  to_instrument_id: number | null;
  to_asset_id: number | null;
  from_amount: number;
  to_amount: number;
  from_amount_unit: number | null;
  to_amount_unit: number | null;
  date: string;
}

export const defaultGoalTransferFormData: GoalTransferFormData = {
  from_wallet_id: null,
  from_goal_id: null,
  from_instrument_id: null,
  from_asset_id: null,
  to_wallet_id: null,
  to_goal_id: null,
  to_instrument_id: null,
  to_asset_id: null,
  from_amount: 0,
  to_amount: 0,
  from_amount_unit: null,
  to_amount_unit: null,
  date: new Date().toISOString().split("T")[0],
};

export const mapGoalTransferToFormData = (transfer: GoalTransferModel): Partial<GoalTransferFormData> => ({
  from_wallet_id: transfer.from_wallet_id ?? null,
  from_goal_id: transfer.from_goal_id ?? null,
  from_instrument_id: transfer.from_instrument_id ?? null,
  from_asset_id: transfer.from_asset_id ?? null,
  to_wallet_id: transfer.to_wallet_id ?? null,
  to_goal_id: transfer.to_goal_id ?? null,
  to_instrument_id: transfer.to_instrument_id ?? null,
  to_asset_id: transfer.to_asset_id ?? null,
  from_amount: transfer.from_amount || 0,
  to_amount: transfer.to_amount || 0,
  from_amount_unit: transfer.from_amount_unit,
  to_amount_unit: transfer.to_amount_unit,
  date: transfer.date || new Date().toISOString().split("T")[0],
});

export interface GoalTransferFilter {
  ids?: number[];
}

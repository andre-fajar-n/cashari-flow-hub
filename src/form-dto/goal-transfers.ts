export interface GoalTransferFormData {
  from_wallet_id: number;
  from_goal_id: number;
  from_instrument_id: number;
  from_asset_id: number;
  to_wallet_id: number;
  to_goal_id: number;
  to_instrument_id: number;
  to_asset_id: number;
  amount_from: number;
  amount_to: number;
  date: string;
}

export const defaultGoalTransferFormData: GoalTransferFormData = {
  from_wallet_id: 0,
  from_goal_id: 0,
  from_instrument_id: 0,
  from_asset_id: 0,
  to_wallet_id: 0,
  to_goal_id: 0,
  to_instrument_id: 0,
  to_asset_id: 0,
  amount_from: 0,
  amount_to: 0,
  date: new Date().toISOString().split("T")[0],
};

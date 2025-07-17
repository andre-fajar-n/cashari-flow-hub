export interface GoalTransferFormData {
  from_wallet_id: number;
  from_goal_id: number;
  from_instrument_id: number;
  from_asset_id: number;
  to_wallet_id: number;
  to_goal_id: number;
  to_instrument_id: number;
  to_asset_id: number;
  from_amount: number;
  to_amount: number;
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
  from_amount: 0,
  to_amount: 0,
  date: new Date().toISOString().split("T")[0],
};

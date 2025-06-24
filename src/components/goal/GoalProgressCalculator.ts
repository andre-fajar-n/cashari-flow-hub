
export interface GoalProgressData {
  totalAmount: number;
  percentage: number;
  transferAmount: number;
  recordAmount: number;
}

export const calculateGoalProgress = (
  goalId: number,
  targetAmount: number,
  goalTransfers?: any[],
  goalRecords?: any[]
): GoalProgressData => {
  // Calculate from transfers
  const transfers = goalTransfers?.filter(t => t.to_goal_id === goalId) || [];
  const transferAmount = transfers.reduce((sum, transfer) => sum + transfer.amount_to, 0);
  
  // Calculate from investment records
  const records = goalRecords?.filter(r => r.goal_id === goalId && !r.is_valuation) || [];
  const recordAmount = records.reduce((sum, record) => sum + record.amount, 0);
  
  const totalAmount = transferAmount + recordAmount;
  const percentage = Math.min((totalAmount / targetAmount) * 100, 100);
  
  return { totalAmount, percentage, transferAmount, recordAmount };
};

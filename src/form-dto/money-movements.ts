export interface MoneyMovementFilter {
  resourceType?: string;
  resourceIds?: number[];
  goalId?: number;
  walletId?: number;
  instrumentId?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  assetId?: number;
}

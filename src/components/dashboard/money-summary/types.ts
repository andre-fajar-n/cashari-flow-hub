// Types for money summary components
export interface AmountDisplayData {
  originalAmount: number;
  calculatedAmount: number;
  unrealizedAmount: number;
  currency: string;
  baseCurrency?: string;
  exchangeRate?: number;
  showBaseCurrency?: boolean;
}

export interface InfoColumnData {
  name: string;
  rate?: number;
  rateDate?: string;
  hasNullRate?: boolean;
  unit?: number;
  assetValueDate?: string;
}

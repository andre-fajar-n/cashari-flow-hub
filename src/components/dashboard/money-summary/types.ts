// Types for money summary components
export interface AmountDisplayData {
  originalAmount: number;
  calculatedAmount: number;
  unrealizedAmount: number;
  currency: string;
  currencySymbol: string;
  baseCurrency?: string;
  baseCurrencySymbol?: string;
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

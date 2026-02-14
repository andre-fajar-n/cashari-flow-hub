// Types for money summary components
export interface AmountDisplayData {
  originalAmount: number;
  calculatedAmount: number;
  unrealizedAmount: number;
  active_capital: number;
  active_capital_base_currency: number;
  unrealized_profit: number;
  unrealized_asset_profit_base_currency: number;
  unrealized_currency_profit: number;
  current_value: number;
  current_value_base_currency: number;
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

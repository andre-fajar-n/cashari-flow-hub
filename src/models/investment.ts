export interface DetailSummary {
  // Aggregated values in original currency
  investedCapital: number;
  activeCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null;
  originalCurrencyCode: string;

  // Base currency aggregates (for multi-currency comparison)
  investedCapitalBaseCurrency: number;
  activeCapitalBaseCurrency: number;
  currentValueBaseCurrency: number;
  totalProfitBaseCurrency: number;
  baseCurrencyCode: string;

  // Profit breakdown
  realizedProfit: number;
  realizedProfitBaseCurrency: number;
  unrealizedProfit: number;
  unrealizedAssetProfit: number;
  unrealizedCurrencyProfit: number;
  unrealizedProfitPercentage: number | null;

  // Trackable indicator
  isTrackable: boolean;

  // Currency context
  isMultiCurrency: boolean;
  uniqueCurrencies: string[];

  // Raw data for breakdown
  items: InvestmentSummaryExtended[];
}

// Extended type for investment_summary view that includes fields not in auto-generated types
export interface InvestmentSummaryExtended {
  active_capital: number | null;
  amount_unit: number | null;
  asset_id: number | null;
  asset_name: string | null;
  base_currency_code: string | null;
  current_value: number | null;
  current_value_base_currency: number | null;
  goal_id: number | null;
  goal_name: string | null;
  instrument_id: number | null;
  instrument_name: string | null;
  invested_capital: number | null;
  invested_capital_base_currency: number | null;
  is_trackable: boolean | null;
  original_currency_code: string | null;
  realized_profit: number | null;
  realized_profit_base_currency: number | null;
  total_profit: number | null;
  total_profit_base_currency: number | null;
  unrealized_profit: number | null;
  wallet_id: number | null;
  wallet_name: string | null;
  // Extended fields from the actual view
  active_capital_base_currency?: number | null;
  avg_exchange_rate?: number | null;
  avg_unit_price?: number | null;
  unrealized_asset_profit_base_currency?: number | null;
  unrealized_currency_profit?: number | null;
};

export interface GoalDetailSummary {
  // Aggregated values in base currency
  totalInvestedCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null;
  baseCurrencyCode: string;

  // Raw data for breakdown
  items: InvestmentSummaryExtended[];
}

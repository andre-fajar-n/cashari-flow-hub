import { Database } from "@/integrations/supabase/types";

export type MoneySummaryModel = Database["public"]["Views"]["money_summary"]["Row"];

export interface MoneySummaryGroupByCurrency {
  original_currency_code: string;
  original_currency_symbol: string;
  amount: number;
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
  base_currency_code: string | null;
  base_currency_symbol: string | null;
  latest_rate: number | null;
  latest_rate_date: string | null;
}

export interface WalletSummary {
  wallet_id: number;
  wallet_name: string;
  amount: number;
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
  original_currency_code: string;
  original_currency_symbol: string;
  latest_rate: number | null;
  latest_rate_date: string | null;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
  instruments: InstrumentSummary[];
}

export interface InstrumentSummary {
  instrument_id: number | null;
  instrument_name: string | null;
  amount: number;
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
  original_currency_code: string;
  original_currency_symbol: string;
  latest_rate: number | null;
  latest_rate_date: string | null;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
  assets: AssetSummary[];
}

export interface AssetSummary {
  asset_id: number | null;
  asset_name: string | null;
  amount: number;
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
  amount_unit: number | null;
  original_currency_code: string;
  original_currency_symbol: string;
  latest_asset_value: number | null;
  latest_asset_value_date: string | null;
  latest_rate: number | null;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
}

export interface AssetSummaryData {
  assetId: number;
  assetName: string;
  latestAssetValue: number | null;
  latestAssetValueDate: string | null;
  totalAmount: number;
  totalAmountUnit: number;
  currencyCode: string;
  currencySymbol: string;
  activeCapital: number;
  unrealizedAmount: number | null;
  unrealizedCurrencyProfit: number | null;
  currentValue: number | null;

  // Base Currency fields
  activeCapitalBaseCurrency: number;
  unrealizedAssetProfitBaseCurrency: number | null;
  currentValueBaseCurrency: number | null;
  baseCurrencyCode: string | null;
  baseCurrencySymbol: string | null;
}
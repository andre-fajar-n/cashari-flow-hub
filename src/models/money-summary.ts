export interface MoneySummaryModel {
  wallet_id: number | null;
  wallet_name: string | null;
  goal_id: number | null;
  goal_name: string | null;
  instrument_id: number | null;
  instrument_name: string | null;
  asset_id: number | null;
  asset_name: string | null;
  asset_symbol: string | null;
  original_currency_code: string | null;
  amount: number | null;
  base_currency_code: string | null;
  latest_rate: number | null;
  latest_rate_date: string | null;
  amount_unit: number | null;
  latest_asset_value: number | null;
  latest_asset_value_date: string | null;
  user_id: string | null;
  unit_label: string | null;
}

export interface MoneySummaryGroupByCurrency {
  original_currency_code: string;
  amount: number;
  base_currency_code: string | null;
  latest_rate: number | null;
  latest_rate_date: string | null;
}

export interface WalletSummary {
  wallet_id: number;
  wallet_name: string;
  amount: number;
  original_currency_code: string;
  instruments: InstrumentSummary[];
}

interface InstrumentSummary {
  instrument_id: number | null;
  instrument_name: string | null;
  amount: number;
  original_currency_code: string;
  assets: AssetSummary[];
}

interface AssetSummary {
  asset_id: number | null;
  asset_name: string | null;
  amount: number;
  amount_unit: number | null;
  original_currency_code: string;
  latest_asset_value: number | null;
  latest_rate: number | null;
  base_currency_code: string | null;  
}
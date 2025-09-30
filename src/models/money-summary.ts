import { Database } from "@/integrations/supabase/types";

export type MoneySummaryModel = Database["public"]["Views"]["money_summary"]["Row"];

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
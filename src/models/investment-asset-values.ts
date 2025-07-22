
export interface InvestmentAssetValueModel {
  id: number;
  asset_id: number;
  value: number;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  investment_assets?: {
    name: string;
    symbol: string;
    currency_code: string;
  };
}

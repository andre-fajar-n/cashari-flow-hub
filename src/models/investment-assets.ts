
export interface InvestmentAssetModel {
  id: number;
  name: string;
  symbol: string;
  instrument_id: number;
  currency_code?: string;
  created_at: string;
  investment_instruments?: {
    name: string;
  };
}

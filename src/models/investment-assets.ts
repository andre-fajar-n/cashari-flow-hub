export interface InvestmentAssetModel {
  id: number;
  name: string;
  symbol: string;
  instrument_id: number;
  created_at: string;
  investment_instruments?: {
    name: string;
  };
}

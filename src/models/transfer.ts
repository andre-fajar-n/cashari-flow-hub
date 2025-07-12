export interface TransferModel {
  id: number;
  from_wallet_id: number;
  to_wallet_id: number;
  amount_from: number;
  amount_to: number;
  currency_from: string;
  currency_to: string;
  date: string;
  from_wallet?: {
    name: string;
  };
  to_wallet?: {
    name: string;
  };
  from_currency?: {
    symbol: string;
  };
  to_currency?: {
    symbol: string;
  };
}
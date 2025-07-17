export interface TransferModel {
  id: number;
  from_wallet_id: number;
  to_wallet_id: number;
  from_amount: number;
  to_amount: number;
  from_currency: string;
  to_currency: string;
  date: string;
  from_wallet?: {
    name: string;
  };
  to_wallet?: {
    name: string;
  };
  from_currency_detail?: {
    symbol: string;
  };
  to_currency_detail?: {
    symbol: string;
  };
}
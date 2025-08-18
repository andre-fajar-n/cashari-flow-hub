import { WalletModel } from "@/models/wallets";

export interface TransferModel {
  id: number;
  from_wallet_id: number;
  to_wallet_id: number;
  from_amount: number;
  to_amount: number;
  date: string;
  from_wallet?: WalletModel;
  to_wallet?: WalletModel;
}

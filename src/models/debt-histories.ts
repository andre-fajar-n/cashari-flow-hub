import { CategoryModel } from "@/models/categories";
import { WalletModel } from "@/models/wallets";

export interface DebtHistoryModel {
  id: number;
  debt_id: number;
  wallet_id: number;
  category_id: number;
  amount: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
  categories?: CategoryModel;
  wallets?: WalletModel;
}

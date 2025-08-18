import { WalletModel } from "@/models/wallets"
import { CategoryModel } from "@/models/categories"

export interface TransactionModel {
  id: number
  amount: number
  category_id: number
  created_at: string | null
  date: string
  description: string | null
  updated_at: string | null
  user_id: string
  wallet_id: number
  wallets: WalletModel
  categories: CategoryModel
}

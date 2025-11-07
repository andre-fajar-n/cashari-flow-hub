import { CategoryModel } from "@/models/categories";
import { WalletModel } from "@/models/wallets";
import { DebtModel } from "@/models/debts";
import { Database } from "@/integrations/supabase/types";

export type DebtHistoryModel = Database["public"]["Tables"]["debt_histories"]["Row"] & {
  wallets: WalletModel;
  categories: CategoryModel;
  debts: DebtModel;
};

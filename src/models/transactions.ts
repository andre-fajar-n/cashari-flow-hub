import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";
import { Database } from "@/integrations/supabase/types";
import { BudgetItemModel } from "@/models/budget-items";
import { BusinessProjectTransactionModel } from "@/models/business-project-transactions";

export type TransactionModel = Database["public"]["Tables"]["transactions"]["Row"] & {
  wallets: WalletModel;
  categories: CategoryModel;
  budget_items: BudgetItemModel[];
  business_project_transactions: BusinessProjectTransactionModel[];
};

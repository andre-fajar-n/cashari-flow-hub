import { Database } from "@/integrations/supabase/types";
import { WalletRelation } from "@/models/wallets";
import { CategoryRelation } from "@/models/categories";
import { BudgetItemModel } from "@/models/budget-items";
import { BusinessProjectTransactionModel } from "@/models/business-project-transactions";

export type TransactionModel = Database["public"]["Tables"]["transactions"]["Row"] & {
  wallets?: WalletRelation;
  categories?: CategoryRelation;
  budget_items?: BudgetItemModel[];
  business_project_transactions?: BusinessProjectTransactionModel[];
};

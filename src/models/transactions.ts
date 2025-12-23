import { WalletPartial } from "@/models/wallets";
import { Database } from "@/integrations/supabase/types";
import { BudgetItemModel } from "@/models/budget-items";
import { BusinessProjectTransactionModel } from "@/models/business-project-transactions";

export type TransactionCategoryPartial = {
  id: number;
  name: string;
  is_income: boolean | null;
  parent_id?: number | null;
  application?: string | null;
};

export type TransactionModel = Database["public"]["Tables"]["transactions"]["Row"] & {
  wallets?: WalletPartial;
  categories?: TransactionCategoryPartial;
  budget_items?: BudgetItemModel[];
  business_project_transactions?: BusinessProjectTransactionModel[];
};

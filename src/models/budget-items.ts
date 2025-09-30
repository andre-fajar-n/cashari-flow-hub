import { Database } from "@/integrations/supabase/types";
import { BudgetModel } from "@/models/budgets";

export type BudgetItemModel = Database["public"]["Tables"]["budget_items"]["Row"] & {
  budgets: BudgetModel;
};

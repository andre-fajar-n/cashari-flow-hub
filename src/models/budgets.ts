import { Database } from "@/integrations/supabase/types";

export type BudgetModel = Database["public"]["Tables"]["budgets"]["Row"];

export type BudgetSummary = Database["public"]["Views"]["budget_summary"]["Row"];

export type BudgetItemWithTransactions = Database["public"]["Views"]["budget_item_with_transactions"]["Row"];

export interface BudgetSummaryGroupByCurrency {
  currency_code: string;
  total_spent: number;
  base_currency_code: string | null;
  total_spent_in_base_currency: number | null;
  has_exchange_rate: boolean;
}
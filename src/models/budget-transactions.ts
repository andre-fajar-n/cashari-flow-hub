import { Database } from "@/integrations/supabase/types";

// Type derived from budget_item_with_transactions view - DRY from types.ts
export type BudgetItemWithTransactions = Database["public"]["Views"]["budget_item_with_transactions"]["Row"];

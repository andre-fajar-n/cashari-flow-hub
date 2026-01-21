import { Database } from "@/integrations/supabase/types";

export type InvestmentSummaryModel = Database["public"]["Views"]["investment_summary"]["Row"];

export interface GoalInvestmentSummary {
  goal_id: number;
  invested_capital_base_currency: number;
  current_value_base_currency: number;
  total_profit_base_currency: number;
  roi: number | null; // total_profit / invested_capital * 100
  original_currency_code: string;
}

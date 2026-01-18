import { Database } from "@/integrations/supabase/types";

export type InvestmentSummaryModel = Database["public"]["Views"]["investment_summary"]["Row"];

export interface GoalInvestmentSummary {
  goal_id: number;
  invested_capital: number;
  current_value: number;
  total_profit: number;
  roi: number | null; // total_profit / invested_capital * 100
  original_currency_code: string;
}

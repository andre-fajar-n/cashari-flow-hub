import { Database } from "@/integrations/supabase/types";

export type DebtSummaryModel = Database["public"]["Views"]["debt_summary"]["Row"];

export interface DebtSummaryGroupByCurrency {
  currency_code: string;
  currency_symbol: string;
  income_amount: number;
  outcome_amount: number;
  net_amount: number;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
  income_amount_in_base_currency: number | null;
  outcome_amount_in_base_currency: number | null;
  net_amount_in_base_currency: number | null;
  has_exchange_rate: boolean;
}

export interface DebtSummaryWithCalculations extends DebtSummaryModel {
  net_amount: number;
  net_amount_in_base_currency: number | null;
  has_exchange_rate: boolean;
}

export interface DebtSummaryModel {
  user_id: string | null;
  debt_id: number | null;
  debt_name: string | null;
  income_amount: number | null;
  outcome_amount: number | null;
  currency_code: string | null;
  income_amount_in_base_currency: number | null;
  outcome_amount_in_base_currency: number | null;
  base_currency_code: string | null;
}

export interface DebtSummaryGroupByCurrency {
  currency_code: string;
  income_amount: number;
  outcome_amount: number;
  net_amount: number;
  base_currency_code: string | null;
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

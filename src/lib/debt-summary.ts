import { DebtSummaryModel, DebtSummaryGroupByCurrency, DebtSummaryWithCalculations } from "@/models/debt-summary";

export const calculateDebtSummary = (summaryData: DebtSummaryModel[]): DebtSummaryWithCalculations[] => {
  return summaryData.map(item => {
    const income = item.income_amount || 0;
    const outcome = item.outcome_amount || 0;
    const net_amount = income + outcome;

    const incomeInBase = item.income_amount_in_base_currency;
    const outcomeInBase = item.outcome_amount_in_base_currency;
    const net_amount_in_base_currency =
      incomeInBase !== null && outcomeInBase !== null
        ? incomeInBase + outcomeInBase
        : null;

    const has_exchange_rate =
      item.base_currency_code !== null &&
      item.currency_code !== item.base_currency_code &&
      incomeInBase !== null &&
      outcomeInBase !== null;

    return {
      ...item,
      net_amount,
      net_amount_in_base_currency,
      has_exchange_rate
    };
  });
};

export const groupDebtSummaryByCurrency = (summaryData: DebtSummaryModel[]): DebtSummaryGroupByCurrency[] => {
  const currencyMap = new Map<string, DebtSummaryGroupByCurrency>();

  summaryData.forEach(item => {
    const currency = item.currency_code || 'Unknown';

    if (!currencyMap.has(currency)) {
      currencyMap.set(currency, {
        currency_code: currency,
        currency_symbol: item.currency_symbol,
        income_amount: 0,
        outcome_amount: 0,
        net_amount: 0,
        base_currency_code: item.base_currency_code,
        base_currency_symbol: item.base_currency_symbol,
        income_amount_in_base_currency: 0,
        outcome_amount_in_base_currency: 0,
        net_amount_in_base_currency: 0,
        has_exchange_rate: false
      });
    }

    const group = currencyMap.get(currency)!;
    group.income_amount += item.income_amount || 0;
    group.outcome_amount += item.outcome_amount || 0;
    group.net_amount = group.income_amount + group.outcome_amount;

    // Handle base currency amounts
    if (item.income_amount_in_base_currency !== null && item.outcome_amount_in_base_currency !== null) {
      group.income_amount_in_base_currency = (group.income_amount_in_base_currency || 0) + item.income_amount_in_base_currency;
      group.outcome_amount_in_base_currency = (group.outcome_amount_in_base_currency || 0) + item.outcome_amount_in_base_currency;
      group.net_amount_in_base_currency = (group.income_amount_in_base_currency || 0) + (group.outcome_amount_in_base_currency || 0);
      group.has_exchange_rate = true;
    } else {
      // If any item doesn't have exchange rate, mark the whole group as not having complete exchange rate
      if (item.currency_code !== item.base_currency_code) {
        group.income_amount_in_base_currency = null;
        group.outcome_amount_in_base_currency = null;
        group.net_amount_in_base_currency = null;
        group.has_exchange_rate = false;
      }
    }
  });

  return Array.from(currencyMap.values());
};

export const calculateTotalInBaseCurrency = (summaryData: DebtSummaryModel[]): {
  total_income: number | null;
  total_outcome: number | null;
  total_net: number | null;
  can_calculate: boolean;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
} => {
  const groupedData = groupDebtSummaryByCurrency(summaryData);

  let total_income = 0;
  let total_outcome = 0;
  let can_calculate = true;
  let base_currency_code: string | null = null;
  let base_currency_symbol: string | null = null;

  for (const group of groupedData) {
    if (group.base_currency_code) {
      base_currency_code = group.base_currency_code;
      base_currency_symbol = group.base_currency_symbol;
    }

    if (group.currency_code === group.base_currency_code) {
      // Same currency as base, use original amounts
      total_income += group.income_amount;
      total_outcome += group.outcome_amount;
    } else if (group.has_exchange_rate && group.income_amount_in_base_currency !== null && group.outcome_amount_in_base_currency !== null) {
      // Different currency but has exchange rate
      total_income += group.income_amount_in_base_currency;
      total_outcome += group.outcome_amount_in_base_currency;
    } else {
      // No exchange rate available
      can_calculate = false;
      break;
    }
  }

  if (!can_calculate) {
    return {
      total_income: null,
      total_outcome: null,
      total_net: null,
      can_calculate: false,
      base_currency_code,
      base_currency_symbol
    };
  }

  return {
    total_income,
    total_outcome,
    total_net: total_income + total_outcome,
    can_calculate: true,
    base_currency_code,
    base_currency_symbol
  };
};

/**
 * Calculate debt progress metrics based on debt type
 * 
 * For 'loan' (hutang - we borrowed money):
 * - totalInitial = income (money we received)
 * - totalPaid = absolute value of outcome (payments we made)
 * - remaining = totalInitial + outcome (outcome is negative, so this subtracts)
 * 
 * For 'borrowed' (piutang - someone borrowed from us):
 * - totalInitial = absolute value of outcome (money we lent)
 * - totalPaid = income (repayments we received)
 * - remaining = totalInitial + income (income is positive but less than initial)
 */
export const calculateDebtProgress = (
  totalIncome: number,
  totalOutcome: number,
  debtType: 'loan' | 'borrowed'
): {
  totalInitial: number;
  totalPaid: number;
  remaining: number;
  progressPercentage: number;
} => {
  let totalInitial: number;
  let totalPaid: number;
  let remaining: number;

  if (debtType === 'loan') {
    // For loan: we received money (income) and we pay it back (outcome is negative)
    totalInitial = totalIncome;
    totalPaid = Math.abs(totalOutcome);
    remaining = totalInitial + totalOutcome; // outcome is negative, so this subtracts
  } else {
    // For borrowed: we lent money (outcome is negative) and receive repayments (income)
    totalInitial = Math.abs(totalOutcome);
    totalPaid = totalIncome;
    remaining = totalInitial + totalOutcome; // outcome is negative, income is positive
  }

  const progressPercentage = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;

  return {
    totalInitial,
    totalPaid,
    remaining,
    progressPercentage
  };
};

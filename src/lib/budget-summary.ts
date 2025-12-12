import { BudgetSummary, BudgetSummaryGroupByCurrency } from "@/models/budgets";

export const groupBudgetSummaryByCurrency = (summaryData: BudgetSummary[]): BudgetSummaryGroupByCurrency[] => {
  const currencyMap = new Map<string, BudgetSummaryGroupByCurrency>();

  summaryData.forEach(item => {
    const currency = item.original_currency_code || 'Unknown';

    if (!currencyMap.has(currency)) {
      currencyMap.set(currency, {
        currency_code: currency,
        currency_symbol: item.original_currency_symbol || 'Unknown',
        total_spent: 0,
        base_currency_code: item.base_currency_code,
        base_currency_symbol: item.base_currency_symbol,
        total_spent_in_base_currency: 0,
        has_exchange_rate: false
      });
    }

    const group = currencyMap.get(currency)!;

    // Add to original currency amount
    group.total_spent += item.amount || 0;

    // Handle base currency amounts
    if (item.amount_in_base_currency !== null && item.amount_in_base_currency !== undefined) {
      group.total_spent_in_base_currency = (group.total_spent_in_base_currency || 0) + item.amount_in_base_currency;
      group.has_exchange_rate = true;
    } else {
      // If any item doesn't have exchange rate, mark the whole group as not having complete exchange rate
      if (item.original_currency_code !== item.base_currency_code) {
        group.total_spent_in_base_currency = null;
        group.has_exchange_rate = false;
      }
    }
  });

  return Array.from(currencyMap.values());
};

export const calculateTotalSpentInBaseCurrency = (summaryData: BudgetSummary[]): {
  total_spent: number | null;
  can_calculate: boolean;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
} => {
  const groupedData = groupBudgetSummaryByCurrency(summaryData);

  let total_spent = 0;
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
      total_spent += group.total_spent;
    } else if (group.has_exchange_rate && group.total_spent_in_base_currency !== null) {
      // Different currency but has exchange rate
      total_spent += group.total_spent_in_base_currency;
    } else {
      // No exchange rate available
      can_calculate = false;
      break;
    }
  }

  return {
    total_spent: can_calculate ? total_spent : null,
    can_calculate,
    base_currency_code,
    base_currency_symbol
  };
};

import { AmountDisplayData } from "./types";

/**
 * Helper function to create amount data for components
 * Calculates unrealized amount and determines if base currency should be shown
 */
export const createAmountData = (
  originalAmount: number,
  calculatedAmount: number,
  currency: string,
  baseCurrency?: string,
  exchangeRate?: number
): AmountDisplayData => ({
  originalAmount,
  calculatedAmount,
  unrealizedAmount: calculatedAmount - originalAmount,
  currency,
  baseCurrency,
  exchangeRate: exchangeRate || 0,
  showBaseCurrency: !!(exchangeRate && baseCurrency && baseCurrency !== currency)
});

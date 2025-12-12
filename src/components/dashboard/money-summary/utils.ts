import { AmountDisplayData } from "@/components/dashboard/money-summary/types";

/**
 * Helper function to create amount data for components
 * Calculates unrealized amount and determines if base currency should be shown
 */
export const createAmountData = (
  originalAmount: number,
  calculatedAmount: number,
  currency: string,
  currencySymbol: string,
  baseCurrency?: string,
  baseCurrencySymbol?: string,
  exchangeRate?: number
): AmountDisplayData => ({
  originalAmount,
  calculatedAmount,
  unrealizedAmount: calculatedAmount - originalAmount,
  currency,
  currencySymbol,
  baseCurrency,
  baseCurrencySymbol,
  exchangeRate: exchangeRate || 0,
  showBaseCurrency: !!(exchangeRate && baseCurrency && baseCurrency !== currency)
});

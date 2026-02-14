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
  exchangeRate?: number,
  active_capital?: number,
  active_capital_base_currency?: number,
  unrealized_profit?: number,
  unrealized_asset_profit_base_currency?: number,
  unrealized_currency_profit?: number,
  current_value?: number,
  current_value_base_currency?: number
): AmountDisplayData => ({
  originalAmount,
  calculatedAmount,
  unrealizedAmount: calculatedAmount - originalAmount,
  active_capital: active_capital || 0,
  active_capital_base_currency: active_capital_base_currency || 0,
  unrealized_profit: unrealized_profit || 0,
  unrealized_asset_profit_base_currency: unrealized_asset_profit_base_currency || 0,
  unrealized_currency_profit: unrealized_currency_profit || 0,
  current_value: current_value || 0,
  current_value_base_currency: current_value_base_currency || 0,
  currency,
  currencySymbol,
  baseCurrency,
  baseCurrencySymbol,
  exchangeRate: exchangeRate || 0,
  showBaseCurrency: !!(exchangeRate && baseCurrency && baseCurrency !== currency)
});

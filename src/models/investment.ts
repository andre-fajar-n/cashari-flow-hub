import { InvestmentSummaryModel } from "@/models/investment-summary";

export interface DetailSummary {
  // Aggregated values in original currency
  investedCapital: number;
  activeCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null;
  originalCurrencyCode: string;

  // Base currency aggregates (for multi-currency comparison)
  investedCapitalBaseCurrency: number;
  activeCapitalBaseCurrency: number;
  currentValueBaseCurrency: number;
  totalProfitBaseCurrency: number;
  baseCurrencyCode: string;

  // Profit breakdown
  realizedProfit: number;
  realizedProfitBaseCurrency: number;
  unrealizedProfit: number;
  unrealizedAssetProfit: number;
  unrealizedCurrencyProfit: number;
  unrealizedProfitPercentage: number | null;

  // Trackable indicator
  isTrackable: boolean;

  // Currency context
  isMultiCurrency: boolean;
  uniqueCurrencies: string[];

  // Raw data for breakdown
  items: InvestmentSummaryModel[];
}

export interface GoalDetailSummary {
  // Aggregated values in base currency
  totalInvestedCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null;
  baseCurrencyCode: string;

  // Raw data for breakdown
  items: InvestmentSummaryModel[];
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { GoalDetailSummary } from "@/models/investment";
import { InvestmentSummaryModel } from "@/models/investment-summary";

export interface WalletBreakdown {
  walletId: number;
  walletName: string;
  originalCurrencyCode: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  currentValue: number;
  currentValueBaseCurrency: number;
  totalProfitBaseCurrency: number;
  instruments: InstrumentBreakdown[];
}

export interface InstrumentBreakdown {
  instrumentId: number | null;
  instrumentName: string;
  originalCurrencyCode: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  currentValue: number;
  currentValueBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;
  assets: AssetBreakdown[];
}

export interface AssetBreakdown {
  assetId: number | null;
  assetName: string | null;
  originalCurrencyCode: string;
  isTrackable: boolean;

  // Common fields
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  realizedProfit: number;
  realizedProfitBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;

  // Trackable only fields
  amountUnit: number | null;
  avgUnitPrice: number | null;
  latestUnitPrice: number | null; // current_value / amount_unit
  currentValue: number;
  currentValueBaseCurrency: number;
  unrealizedProfit: number;
  unrealizedProfitBaseCurrency: number | null; // unrealized_asset_profit_base_currency
  unrealizedCurrencyProfit: number | null;
}

export const useGoalDetailSummary = (goalId: number) => {
  const { user } = useAuth();

  return useQuery<GoalDetailSummary>({
    queryKey: ["goal_detail_summary", goalId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_summary")
        .select("*")
        .eq("goal_id", goalId);

      if (error) {
        console.error("Failed to fetch goal detail summary", error);
        throw error;
      }

      // Cast to extended type since the view has more fields than the auto-generated types
      const items = (data || []) as unknown as InvestmentSummaryModel[];

      // Aggregate values
      let totalInvestedCapital = 0;
      let currentValue = 0;
      let totalProfit = 0;
      let baseCurrencyCode = "";

      for (const item of items) {
        totalInvestedCapital += item.invested_capital_base_currency || 0;
        currentValue += item.current_value_base_currency || 0;
        totalProfit += item.total_profit_base_currency || 0;
        if (item.base_currency_code && !baseCurrencyCode) {
          baseCurrencyCode = item.base_currency_code;
        }
      }

      const roi = totalInvestedCapital > 0
        ? (totalProfit / totalInvestedCapital) * 100
        : null;

      return {
        totalInvestedCapital,
        currentValue,
        totalProfit,
        roi,
        baseCurrencyCode,
        items,
      };
    },
    enabled: !!user && !!goalId,
  });
};

export const buildBreakdownData = (items: InvestmentSummaryModel[]): WalletBreakdown[] => {
  const walletMap = new Map<number, WalletBreakdown>();

  for (const item of items) {
    const walletId = item.wallet_id || 0;
    const walletName = item.wallet_name || "Unknown Wallet";
    const instrumentId = item.instrument_id || null;
    const instrumentName = item.instrument_name || "Cash & Wallet";

    // Get or create wallet
    let wallet = walletMap.get(walletId);
    if (!wallet) {
      wallet = {
        walletId,
        walletName,
        originalCurrencyCode: item.original_currency_code || "",
        investedCapital: 0,
        investedCapitalBaseCurrency: 0,
        activeCapital: 0,
        activeCapitalBaseCurrency: 0,
        currentValue: 0,
        currentValueBaseCurrency: 0,
        totalProfitBaseCurrency: 0,
        instruments: [],
      };
      walletMap.set(walletId, wallet);
    }

    // Find or create instrument
    let instrument = wallet.instruments.find(i => i.instrumentId === instrumentId);
    if (!instrument) {
      instrument = {
        instrumentId,
        instrumentName,
        originalCurrencyCode: item.original_currency_code || "",
        investedCapital: 0,
        investedCapitalBaseCurrency: 0,
        activeCapital: 0,
        activeCapitalBaseCurrency: 0,
        currentValue: 0,
        currentValueBaseCurrency: 0,
        totalProfit: 0,
        totalProfitBaseCurrency: 0,
        assets: [],
      };
      wallet.instruments.push(instrument);
    }

    // Calculate latest unit price for trackable assets
    let latestUnitPrice: number | null = null;
    if (item.is_trackable && item.amount_unit && item.amount_unit > 0 && item.current_value) {
      latestUnitPrice = item.current_value / item.amount_unit;
    }

    // Create asset
    const asset: AssetBreakdown = {
      assetId: item.asset_id,
      assetName: item.asset_name,
      originalCurrencyCode: item.original_currency_code || "",
      isTrackable: item.is_trackable || false,
      investedCapital: item.invested_capital || 0,
      investedCapitalBaseCurrency: item.invested_capital_base_currency || 0,
      activeCapital: item.active_capital || 0,
      activeCapitalBaseCurrency: item.active_capital_base_currency || 0,
      realizedProfit: item.realized_profit || 0,
      realizedProfitBaseCurrency: item.realized_profit_base_currency || 0,
      totalProfit: item.total_profit || 0,
      totalProfitBaseCurrency: item.total_profit_base_currency || 0,
      amountUnit: item.amount_unit,
      avgUnitPrice: item.avg_unit_price ?? null,
      latestUnitPrice,
      currentValue: item.current_value || 0,
      currentValueBaseCurrency: item.current_value_base_currency || 0,
      unrealizedProfit: item.unrealized_profit || 0,
      unrealizedProfitBaseCurrency: item.unrealized_asset_profit_base_currency ?? null,
      unrealizedCurrencyProfit: item.unrealized_currency_profit ?? null,
    };

    instrument.assets.push(asset);

    // Update instrument totals
    instrument.investedCapital += asset.investedCapital;
    instrument.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
    instrument.currentValue += asset.currentValue;
    instrument.currentValueBaseCurrency += asset.currentValueBaseCurrency;
    instrument.totalProfit += asset.totalProfit;
    instrument.totalProfitBaseCurrency += asset.totalProfitBaseCurrency;
    instrument.activeCapital += asset.activeCapital;
    instrument.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;

    // Update wallet totals
    wallet.investedCapital += asset.investedCapital;
    wallet.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
    wallet.activeCapital += asset.activeCapital;
    wallet.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;
    wallet.currentValue += asset.currentValue;
    wallet.currentValueBaseCurrency += asset.currentValueBaseCurrency;
    wallet.totalProfitBaseCurrency += asset.totalProfitBaseCurrency;
  }

  // Sort and return
  return Array.from(walletMap.values()).sort((a, b) =>
    b.currentValueBaseCurrency - a.currentValueBaseCurrency || b.totalProfitBaseCurrency - a.totalProfitBaseCurrency
  );
};

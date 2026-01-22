import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// Extended type for investment_summary view that includes fields not in auto-generated types
export interface InvestmentSummaryExtended {
  active_capital: number | null;
  amount_unit: number | null;
  asset_id: number | null;
  asset_name: string | null;
  base_currency_code: string | null;
  current_value: number | null;
  current_value_base_currency: number | null;
  goal_id: number | null;
  goal_name: string | null;
  instrument_id: number | null;
  instrument_name: string | null;
  invested_capital: number | null;
  invested_capital_base_currency: number | null;
  original_currency_code: string | null;
  realized_profit: number | null;
  realized_profit_base_currency: number | null;
  total_profit: number | null;
  total_profit_base_currency: number | null;
  unrealized_profit: number | null;
  wallet_id: number | null;
  wallet_name: string | null;
  // Extended fields from the actual view
  avg_exchange_rate?: number | null;
  avg_unit_price?: number | null;
  unrealized_asset_profit_base_currency?: number | null;
  unrealized_currency_profit?: number | null;
}

export interface GoalDetailSummary {
  // Aggregated values in base currency
  totalInvestedCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null;
  baseCurrencyCode: string;
  
  // Raw data for breakdown
  items: InvestmentSummaryExtended[];
}

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
  instruments: InstrumentBreakdown[];
}

export interface InstrumentBreakdown {
  instrumentId: number | null;
  instrumentName: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
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
  isTrackable: boolean; // determined by unrealized_asset_profit_base_currency not being null
  
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
      const items = (data || []) as unknown as InvestmentSummaryExtended[];
      
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

export const buildBreakdownData = (items: InvestmentSummaryExtended[]): WalletBreakdown[] => {
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
        investedCapital: 0,
        investedCapitalBaseCurrency: 0,
        currentValue: 0,
        currentValueBaseCurrency: 0,
        totalProfit: 0,
        totalProfitBaseCurrency: 0,
        assets: [],
      };
      wallet.instruments.push(instrument);
    }

    // Determine if trackable - based on unrealized_asset_profit_base_currency not being null
    const isTrackable = item.unrealized_asset_profit_base_currency !== null && item.unrealized_asset_profit_base_currency !== undefined;
    
    // Calculate latest unit price for trackable assets
    let latestUnitPrice: number | null = null;
    if (isTrackable && item.amount_unit && item.amount_unit > 0 && item.current_value) {
      latestUnitPrice = item.current_value / item.amount_unit;
    }
    
    // Calculate base currency conversion using avg_exchange_rate
    const avgExchangeRate = item.avg_exchange_rate || 1;

    // Create asset
    const asset: AssetBreakdown = {
      assetId: item.asset_id,
      assetName: item.asset_name,
      originalCurrencyCode: item.original_currency_code || "",
      isTrackable,
      investedCapital: item.invested_capital || 0,
      investedCapitalBaseCurrency: item.invested_capital_base_currency || 0,
      activeCapital: item.active_capital || 0,
      activeCapitalBaseCurrency: (item.active_capital || 0) * avgExchangeRate,
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

    // Update wallet totals
    wallet.investedCapital += asset.investedCapital;
    wallet.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
    wallet.activeCapital += asset.activeCapital;
    wallet.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;
    wallet.currentValue += asset.currentValue;
    wallet.currentValueBaseCurrency += asset.currentValueBaseCurrency;
  }

  // Sort and return
  return Array.from(walletMap.values()).sort((a, b) => 
    b.currentValueBaseCurrency - a.currentValueBaseCurrency
  );
};

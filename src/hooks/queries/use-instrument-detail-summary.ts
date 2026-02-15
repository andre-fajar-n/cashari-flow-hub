import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { InvestmentSummaryExtended } from "@/hooks/queries/use-goal-detail-summary";

export interface InstrumentDetailSummary {
  // Aggregated values in original currency
  totalInvestedCapital: number;
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
  unrealizedProfitBaseCurrency: number;
  unrealizedAssetProfit: number;
  unrealizedCurrencyProfit: number;

  // Trackable indicator
  isTrackable: boolean;

  // Currency context
  isMultiCurrency: boolean;
  uniqueCurrencies: string[];

  // Raw data for breakdown
  items: InvestmentSummaryExtended[];
}

// Breakdown types for Goal-first hierarchy
export interface GoalBreakdownForInstrument {
  goalId: number;
  goalName: string;
  baseCurrencyCode: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  currentValue: number;
  currentValueBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;
  wallets: WalletBreakdownForInstrument[];
}

export interface WalletBreakdownForInstrument {
  walletId: number;
  walletName: string;
  originalCurrencyCode: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  currentValue: number;
  currentValueBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;
  assets: AssetBreakdownForInstrument[];
}

export interface AssetBreakdownForInstrument {
  assetId: number | null;
  assetName: string | null;
  originalCurrencyCode: string;
  isTrackable: boolean;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  realizedProfit: number;
  realizedProfitBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;
  amountUnit: number | null;
  avgUnitPrice: number | null;
  latestUnitPrice: number | null;
  currentValue: number;
  currentValueBaseCurrency: number;
  unrealizedProfit: number;
  unrealizedProfitBaseCurrency: number | null;
  unrealizedCurrencyProfit: number | null;
  // Extra context for instrument view
  goalId: number | null;
  goalName: string | null;
}

// Breakdown types for Wallet-first hierarchy
export interface WalletFirstBreakdown {
  walletId: number;
  walletName: string;
  originalCurrencyCode: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  currentValue: number;
  currentValueBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;
  goals: GoalUnderWallet[];
}

export interface GoalUnderWallet {
  goalId: number;
  goalName: string;
  baseCurrencyCode: string;
  investedCapital: number;
  investedCapitalBaseCurrency: number;
  activeCapital: number;
  activeCapitalBaseCurrency: number;
  currentValue: number;
  currentValueBaseCurrency: number;
  totalProfit: number;
  totalProfitBaseCurrency: number;
  assets: AssetBreakdownForInstrument[];
}

export const useInstrumentDetailSummary = (instrumentId: number) => {
  const { user } = useAuth();

  return useQuery<InstrumentDetailSummary>({
    queryKey: ["instrument_detail_summary", instrumentId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("money_summary")
        .select("*")
        .eq("instrument_id", instrumentId);

      if (error) {
        console.error("Failed to fetch instrument detail summary", error);
        throw error;
      }

      const items = (data || []) as unknown as InvestmentSummaryExtended[];

      // Aggregate values
      let totalInvestedCapital = 0;
      let activeCapital = 0;
      let currentValue = 0;
      let totalProfit = 0;
      let investedCapitalBaseCurrency = 0;
      let activeCapitalBaseCurrency = 0;
      let currentValueBaseCurrency = 0;
      let totalProfitBaseCurrency = 0;
      let realizedProfit = 0;
      let realizedProfitBaseCurrency = 0;
      let unrealizedProfit = 0;
      let unrealizedProfitBaseCurrency = 0;
      let unrealizedAssetProfit = 0;
      let unrealizedCurrencyProfit = 0;
      let originalCurrencyCode = "";
      let baseCurrencyCode = "";
      let hasTrackableAsset = false;
      const currencySet = new Set<string>();

      for (const item of items) {
        const avgExchangeRate = item.avg_exchange_rate || 1;

        totalInvestedCapital += item.invested_capital || 0;
        activeCapital += item.active_capital || 0;
        currentValue += item.current_value || 0;
        totalProfit += item.total_profit || 0;
        investedCapitalBaseCurrency += item.invested_capital_base_currency || 0;
        activeCapitalBaseCurrency += item.active_capital_base_currency || 0;
        currentValueBaseCurrency += item.current_value_base_currency || 0;
        totalProfitBaseCurrency += item.total_profit_base_currency || 0;
        realizedProfit += item.realized_profit || 0;
        realizedProfitBaseCurrency += item.realized_profit_base_currency || 0;
        unrealizedProfit += item.unrealized_profit || 0;

        // Unrealized breakdown
        if (item.unrealized_asset_profit_base_currency != null) {
          unrealizedProfitBaseCurrency += item.unrealized_asset_profit_base_currency;
          unrealizedAssetProfit += item.unrealized_asset_profit_base_currency - (item.unrealized_currency_profit || 0);
          hasTrackableAsset = true;
        }
        if (item.unrealized_currency_profit != null) {
          unrealizedCurrencyProfit += item.unrealized_currency_profit;
        }

        if (item.original_currency_code) {
          currencySet.add(item.original_currency_code);
          if (!originalCurrencyCode) {
            originalCurrencyCode = item.original_currency_code;
          }
        }
        if (item.base_currency_code && !baseCurrencyCode) {
          baseCurrencyCode = item.base_currency_code;
        }
      }

      // ROI = Total Profit / Invested Capital (NOT Active Capital)
      const roi = investedCapitalBaseCurrency > 0
        ? (totalProfitBaseCurrency / investedCapitalBaseCurrency) * 100
        : null;

      const uniqueCurrencies = Array.from(currencySet);

      return {
        totalInvestedCapital,
        activeCapital,
        currentValue,
        totalProfit,
        roi,
        originalCurrencyCode,
        investedCapitalBaseCurrency,
        activeCapitalBaseCurrency,
        currentValueBaseCurrency,
        totalProfitBaseCurrency,
        baseCurrencyCode,
        realizedProfit,
        realizedProfitBaseCurrency,
        unrealizedProfit,
        unrealizedProfitBaseCurrency,
        unrealizedAssetProfit,
        unrealizedCurrencyProfit,
        isTrackable: hasTrackableAsset,
        isMultiCurrency: uniqueCurrencies.length > 1,
        uniqueCurrencies,
        items,
      };
    },
    enabled: !!user && !!instrumentId,
  });
};

// Build Goal → Wallet → Asset hierarchy
export const buildGoalFirstBreakdown = (items: InvestmentSummaryExtended[]): GoalBreakdownForInstrument[] => {
  const goalMap = new Map<number, GoalBreakdownForInstrument>();

  for (const item of items) {
    const goalId = item.goal_id || 0;
    const goalName = item.goal_name || "Unknown Goal";
    const walletId = item.wallet_id || 0;
    const walletName = item.wallet_name || "Unknown Wallet";

    // Get or create goal
    let goal = goalMap.get(goalId);
    if (!goal) {
      goal = {
        goalId,
        goalName,
        baseCurrencyCode: item.base_currency_code || "",
        investedCapital: 0,
        investedCapitalBaseCurrency: 0,
        activeCapital: 0,
        activeCapitalBaseCurrency: 0,
        currentValue: 0,
        currentValueBaseCurrency: 0,
        totalProfit: 0,
        totalProfitBaseCurrency: 0,
        wallets: [],
      };
      goalMap.set(goalId, goal);
    }

    // Find or create wallet under goal
    let wallet = goal.wallets.find(w => w.walletId === walletId);
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
        totalProfit: 0,
        totalProfitBaseCurrency: 0,
        assets: [],
      };
      goal.wallets.push(wallet);
    }

    // Create asset
    const asset = createAssetFromItem(item);
    wallet.assets.push(asset);

    // Update totals
    updateWalletTotals(wallet, asset);
    updateGoalTotals(goal, asset);
  }

  return Array.from(goalMap.values()).sort((a, b) =>
    b.currentValueBaseCurrency - a.currentValueBaseCurrency
  );
};

// Build Wallet → Goal → Asset hierarchy
export const buildWalletFirstBreakdown = (items: InvestmentSummaryExtended[]): WalletFirstBreakdown[] => {
  const walletMap = new Map<number, WalletFirstBreakdown>();

  for (const item of items) {
    const walletId = item.wallet_id || 0;
    const walletName = item.wallet_name || "Unknown Wallet";
    const goalId = item.goal_id || 0;
    const goalName = item.goal_name || "Unknown Goal";

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
        totalProfit: 0,
        totalProfitBaseCurrency: 0,
        goals: [],
      };
      walletMap.set(walletId, wallet);
    }

    // Find or create goal under wallet
    let goal = wallet.goals.find(g => g.goalId === goalId);
    if (!goal) {
      goal = {
        goalId,
        goalName,
        baseCurrencyCode: item.base_currency_code || "",
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
      wallet.goals.push(goal);
    }

    // Create asset
    const asset = createAssetFromItem(item);
    goal.assets.push(asset);

    // Update goal totals
    goal.investedCapital += asset.investedCapital;
    goal.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
    goal.activeCapital += asset.activeCapital;
    goal.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;
    goal.currentValue += asset.currentValue;
    goal.currentValueBaseCurrency += asset.currentValueBaseCurrency;
    goal.totalProfit += asset.totalProfit;
    goal.totalProfitBaseCurrency += asset.totalProfitBaseCurrency;

    // Update wallet totals
    wallet.investedCapital += asset.investedCapital;
    wallet.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
    wallet.activeCapital += asset.activeCapital;
    wallet.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;
    wallet.currentValue += asset.currentValue;
    wallet.currentValueBaseCurrency += asset.currentValueBaseCurrency;
    wallet.totalProfit += asset.totalProfit;
    wallet.totalProfitBaseCurrency += asset.totalProfitBaseCurrency;
  }

  return Array.from(walletMap.values()).sort((a, b) =>
    b.currentValueBaseCurrency - a.currentValueBaseCurrency
  );
};

// Helper functions
const createAssetFromItem = (item: InvestmentSummaryExtended): AssetBreakdownForInstrument => {
  let latestUnitPrice: number | null = null;
  if (item.is_trackable && item.amount_unit && item.amount_unit > 0 && item.current_value) {
    latestUnitPrice = item.current_value / item.amount_unit;
  }

  const avgExchangeRate = item.avg_exchange_rate || 1;

  return {
    assetId: item.asset_id,
    assetName: item.asset_name,
    originalCurrencyCode: item.original_currency_code || "",
    isTrackable: item.is_trackable || false,
    investedCapital: item.invested_capital || 0,
    investedCapitalBaseCurrency: item.invested_capital_base_currency || 0,
    activeCapital: item.active_capital || 0,
    activeCapitalBaseCurrency: (item as any).active_capital_base_currency || 0,
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
    goalId: item.goal_id,
    goalName: item.goal_name,
  };
};

const updateWalletTotals = (wallet: WalletBreakdownForInstrument, asset: AssetBreakdownForInstrument) => {
  wallet.investedCapital += asset.investedCapital;
  wallet.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
  wallet.activeCapital += asset.activeCapital;
  wallet.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;
  wallet.currentValue += asset.currentValue;
  wallet.currentValueBaseCurrency += asset.currentValueBaseCurrency;
  wallet.totalProfit += asset.totalProfit;
  wallet.totalProfitBaseCurrency += asset.totalProfitBaseCurrency;
};

const updateGoalTotals = (goal: GoalBreakdownForInstrument, asset: AssetBreakdownForInstrument) => {
  goal.investedCapital += asset.investedCapital;
  goal.investedCapitalBaseCurrency += asset.investedCapitalBaseCurrency;
  goal.activeCapital += asset.activeCapital;
  goal.activeCapitalBaseCurrency += asset.activeCapitalBaseCurrency;
  goal.currentValue += asset.currentValue;
  goal.currentValueBaseCurrency += asset.currentValueBaseCurrency;
  goal.totalProfit += asset.totalProfit;
  goal.totalProfitBaseCurrency += asset.totalProfitBaseCurrency;
};

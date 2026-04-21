import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface GoalAllocationItem {
  goalId: number | null;
  goalName: string;
  currentValue: number;
  percentage: number;
}

export interface InstrumentDistributionItem {
  instrumentId: number | null;
  instrumentName: string;
  currentValue: number;
  percentage: number;
}

export interface AssetDistributionItem {
  assetId: number | null;
  assetName: string;
  currentValue: number;
  percentage: number;
}

export interface WalletDistributionItem {
  walletId: number | null;
  walletName: string;
  currentValue: number;
  percentage: number;
}

export interface PortfolioDistributionResult {
  goalAllocation: GoalAllocationItem[];
  instrumentDistribution: InstrumentDistributionItem[];
  assetDistribution: AssetDistributionItem[];
  walletDistribution: WalletDistributionItem[];
  totalCurrentValue: number;
}

interface InvestmentSummaryRow {
  goal_id: number | null;
  goal_name: string | null;
  instrument_id: number | null;
  instrument_name: string | null;
  asset_id: number | null;
  asset_name: string | null;
  wallet_id: number | null;
  wallet_name: string | null;
  current_value_base_currency: number | null;
}

export const usePortfolioDistribution = (): UseQueryResult<PortfolioDistributionResult> => {
  const { user } = useAuth();

  return useQuery<PortfolioDistributionResult>({
    queryKey: ["portfolio_distribution", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_summary")
        .select("goal_id, goal_name, instrument_id, instrument_name, asset_id, asset_name, wallet_id, wallet_name, current_value_base_currency");

      if (error) {
        console.error("Failed to fetch investment summary for portfolio distribution", error);
        throw error;
      }

      const rows = (data || []) as InvestmentSummaryRow[];

      // Group by goal_id
      const goalMap = new Map<string, GoalAllocationItem>();
      for (const row of rows) {
        const key = row.goal_id != null ? String(row.goal_id) : "null";
        const existing = goalMap.get(key);
        const currentVal = row.current_value_base_currency ?? 0;

        if (currentVal === 0) continue;

        if (existing) {
          existing.currentValue += currentVal;
        } else {
          goalMap.set(key, {
            goalId: row.goal_id,
            goalName: row.goal_name ?? "Tanpa Tujuan",
            currentValue: currentVal,
            percentage: 0,
          });
        }
      }

      // Group by instrument_id
      const instrumentMap = new Map<string, InstrumentDistributionItem>();
      for (const row of rows) {
        const key = row.instrument_id != null ? String(row.instrument_id) : "null";
        const existing = instrumentMap.get(key);
        const currentVal = row.current_value_base_currency ?? 0;

        if (currentVal === 0) continue;

        if (existing) {
          existing.currentValue += currentVal;
        } else {
          instrumentMap.set(key, {
            instrumentId: row.instrument_id,
            instrumentName: row.instrument_name ?? "Tanpa Instrumen",
            currentValue: currentVal,
            percentage: 0,
          });
        }
      }

      // Group by asset_id
      const assetMap = new Map<string, AssetDistributionItem>();
      for (const row of rows) {
        const key = `${row.asset_id ?? "null"}-${row.instrument_id ?? "null"}`;
        const existing = assetMap.get(key);
        const currentVal = row.current_value_base_currency ?? 0;

        if (currentVal === 0) continue;

        if (existing) {
          existing.currentValue += currentVal;
        } else {
          assetMap.set(key, {
            assetId: row.asset_id,
            assetName: `${row.asset_name ?? "Tanpa Aset"} (${row.instrument_name ?? "Tanpa Instrumen"})`,
            currentValue: currentVal,
            percentage: 0,
          });
        }
      }

      // Group by wallet_id
      const walletMap = new Map<string, WalletDistributionItem>();
      for (const row of rows) {
        const key = row.wallet_id != null ? String(row.wallet_id) : "null";
        const existing = walletMap.get(key);
        const currentVal = row.current_value_base_currency ?? 0;

        if (currentVal === 0) continue;

        if (existing) {
          existing.currentValue += currentVal;
        } else {
          walletMap.set(key, {
            walletId: row.wallet_id,
            walletName: row.wallet_name ?? "Tanpa Dompet",
            currentValue: currentVal,
            percentage: 0,
          });
        }
      }

      const goalAllocationRaw = Array.from(goalMap.values()).sort(
        (a, b) => b.currentValue - a.currentValue
      );
      const instrumentDistributionRaw = Array.from(instrumentMap.values()).sort(
        (a, b) => b.currentValue - a.currentValue
      );
      const assetDistributionRaw = Array.from(assetMap.values()).sort(
        (a, b) => b.currentValue - a.currentValue
      );

      const walletDistributionRaw = Array.from(walletMap.values()).sort(
        (a, b) => b.currentValue - a.currentValue
      );

      const totalCurrentValue = goalAllocationRaw.reduce(
        (sum, g) => sum + g.currentValue,
        0
      );

      const goalAllocation = goalAllocationRaw.map((g) => ({
        ...g,
        percentage: totalCurrentValue > 0 ? (g.currentValue / totalCurrentValue) * 100 : 0,
      }));

      const instrumentDistribution = instrumentDistributionRaw.map((i) => ({
        ...i,
        percentage: totalCurrentValue > 0 ? (i.currentValue / totalCurrentValue) * 100 : 0,
      }));

      const assetDistribution = assetDistributionRaw.map((a) => ({
        ...a,
        percentage: totalCurrentValue > 0 ? (a.currentValue / totalCurrentValue) * 100 : 0,
      }));

      const walletDistribution = walletDistributionRaw.map((w) => ({
        ...w,
        percentage: totalCurrentValue > 0 ? (w.currentValue / totalCurrentValue) * 100 : 0,
      }));

      return {
        goalAllocation,
        instrumentDistribution,
        assetDistribution,
        walletDistribution,
        totalCurrentValue,
      };
    },
    enabled: !!user,
  });
};

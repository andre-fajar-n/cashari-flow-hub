import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { InvestmentSummaryExtended } from "@/hooks/queries/use-goal-detail-summary";

export interface InstrumentSummary {
  instrumentId: number;
  instrumentName: string;
  unitLabel: string | null;
  isTrackable: boolean;
  
  // Original currency metrics (primary)
  originalCurrencyCode: string;
  activeCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null; // Calculated from original currency
  
  // Base currency metrics (secondary context)
  baseCurrencyCode: string;
  currentValueBaseCurrency: number;
  totalProfitBaseCurrency: number;
}

export const useInstrumentSummary = () => {
  const { user } = useAuth();

  return useQuery<InstrumentSummary[]>({
    queryKey: ["instrument_summary", user?.id],
    queryFn: async () => {
      // Fetch investment summary data
      const { data: summaryData, error: summaryError } = await supabase
        .from("investment_summary")
        .select("*");

      if (summaryError) {
        console.error("Failed to fetch investment summary", summaryError);
        throw summaryError;
      }

      // Fetch instrument metadata for unit_label
      const { data: instrumentData, error: instrumentError } = await supabase
        .from("investment_instruments")
        .select("id, name, unit_label, is_trackable")
        .eq("user_id", user?.id);

      if (instrumentError) {
        console.error("Failed to fetch instruments", instrumentError);
        throw instrumentError;
      }

      const items = (summaryData || []) as unknown as InvestmentSummaryExtended[];
      const instrumentMap = new Map(instrumentData?.map(i => [i.id, i]) || []);

      // Group by instrument_id and aggregate
      const summaryMap = new Map<number, InstrumentSummary>();

      for (const item of items) {
        if (!item.instrument_id) continue;

        const instrumentMeta = instrumentMap.get(item.instrument_id);
        const existing = summaryMap.get(item.instrument_id);

        const activeCapital = item.active_capital || 0;
        const currentValue = item.current_value || 0;
        const totalProfit = item.total_profit || 0;
        const currentValueBaseCurrency = item.current_value_base_currency || 0;
        const totalProfitBaseCurrency = item.total_profit_base_currency || 0;

        if (existing) {
          existing.activeCapital += activeCapital;
          existing.currentValue += currentValue;
          existing.totalProfit += totalProfit;
          existing.currentValueBaseCurrency += currentValueBaseCurrency;
          existing.totalProfitBaseCurrency += totalProfitBaseCurrency;
          // Recalculate ROI based on original currency
          existing.roi = existing.activeCapital > 0
            ? (existing.totalProfit / existing.activeCapital) * 100
            : null;
        } else {
          summaryMap.set(item.instrument_id, {
            instrumentId: item.instrument_id,
            instrumentName: item.instrument_name || instrumentMeta?.name || "Unknown",
            unitLabel: instrumentMeta?.unit_label || null,
            isTrackable: item.is_trackable ?? instrumentMeta?.is_trackable ?? false,
            originalCurrencyCode: item.original_currency_code || "",
            activeCapital,
            currentValue,
            totalProfit,
            roi: activeCapital > 0 ? (totalProfit / activeCapital) * 100 : null,
            baseCurrencyCode: item.base_currency_code || "",
            currentValueBaseCurrency,
            totalProfitBaseCurrency,
          });
        }
      }

      // Sort by current value descending
      return Array.from(summaryMap.values()).sort(
        (a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency
      );
    },
    enabled: !!user,
  });
};

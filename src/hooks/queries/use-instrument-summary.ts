import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// Currency breakdown item
export interface CurrencyBreakdown {
  currencyCode: string;
  activeCapital: number;
  currentValue: number;
}

export interface InstrumentSummary {
  instrumentId: number;
  instrumentName: string;
  unitLabel: string | null;
  isTrackable: boolean;
  
  // Base currency metrics (primary) - from user settings
  baseCurrencyCode: string;
  activeCapitalBaseCurrency: number;
  currentValueBaseCurrency: number;
  totalProfitBaseCurrency: number;
  investedCapitalBaseCurrency: number;
  roi: number | null; // Calculated from base currency
  
  // Currency breakdown for multi-currency display
  currencyBreakdown: CurrencyBreakdown[];
  isMultiCurrency: boolean;
}

interface InvestmentSummaryRow {
  instrument_id: number | null;
  instrument_name: string | null;
  is_trackable: boolean | null;
  original_currency_code: string | null;
  base_currency_code: string | null;
  active_capital: number | null;
  current_value: number | null;
  total_profit: number | null;
  invested_capital: number | null;
  current_value_base_currency: number | null;
  total_profit_base_currency: number | null;
  invested_capital_base_currency: number | null;
  unrealized_asset_profit_base_currency: number | null;
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

      // Fetch user settings for base currency
      const { data: userSettings, error: settingsError } = await supabase
        .from("user_settings")
        .select("base_currency_code")
        .eq("user_id", user?.id)
        .single();

      if (settingsError && settingsError.code !== "PGRST116") {
        console.error("Failed to fetch user settings", settingsError);
      }

      const userBaseCurrency = userSettings?.base_currency_code || "IDR";
      const items = (summaryData || []) as unknown as InvestmentSummaryRow[];
      const instrumentMap = new Map(instrumentData?.map(i => [i.id, i]) || []);

      // Group by instrument_id and aggregate
      const summaryMap = new Map<number, {
        instrumentId: number;
        instrumentName: string;
        unitLabel: string | null;
        isTrackable: boolean;
        baseCurrencyCode: string;
        activeCapitalBaseCurrency: number;
        currentValueBaseCurrency: number;
        totalProfitBaseCurrency: number;
        investedCapitalBaseCurrency: number;
        currencyBreakdownMap: Map<string, CurrencyBreakdown>;
        hasUnrealizedAssetProfit: boolean;
      }>();

      for (const item of items) {
        if (!item.instrument_id) continue;

        const instrumentMeta = instrumentMap.get(item.instrument_id);
        const existing = summaryMap.get(item.instrument_id);

        const activeCapitalBase = item.current_value_base_currency != null 
          ? (item.current_value_base_currency - (item.total_profit_base_currency || 0))
          : (item.invested_capital_base_currency || 0);
        const currentValueBase = item.current_value_base_currency || 0;
        const totalProfitBase = item.total_profit_base_currency || 0;
        const investedCapitalBase = item.invested_capital_base_currency || 0;
        
        // Original currency values for breakdown
        const originalCurrency = item.original_currency_code || "IDR";
        const activeCapitalOriginal = item.active_capital || 0;
        const currentValueOriginal = item.current_value || 0;
        
        // Check if this row has unrealized asset profit (indicator of trackable data)
        const hasUnrealizedAsset = item.unrealized_asset_profit_base_currency != null;

        if (existing) {
          existing.activeCapitalBaseCurrency += activeCapitalBase;
          existing.currentValueBaseCurrency += currentValueBase;
          existing.totalProfitBaseCurrency += totalProfitBase;
          existing.investedCapitalBaseCurrency += investedCapitalBase;
          
          // Track if any row has unrealized asset profit
          if (hasUnrealizedAsset) {
            existing.hasUnrealizedAssetProfit = true;
          }
          
          // Update currency breakdown
          const currencyBreakdown = existing.currencyBreakdownMap.get(originalCurrency);
          if (currencyBreakdown) {
            currencyBreakdown.activeCapital += activeCapitalOriginal;
            currencyBreakdown.currentValue += currentValueOriginal;
          } else {
            existing.currencyBreakdownMap.set(originalCurrency, {
              currencyCode: originalCurrency,
              activeCapital: activeCapitalOriginal,
              currentValue: currentValueOriginal,
            });
          }
        } else {
          const currencyBreakdownMap = new Map<string, CurrencyBreakdown>();
          currencyBreakdownMap.set(originalCurrency, {
            currencyCode: originalCurrency,
            activeCapital: activeCapitalOriginal,
            currentValue: currentValueOriginal,
          });

          summaryMap.set(item.instrument_id, {
            instrumentId: item.instrument_id,
            instrumentName: item.instrument_name || instrumentMeta?.name || "Unknown",
            unitLabel: instrumentMeta?.unit_label || null,
            isTrackable: instrumentMeta?.is_trackable ?? false,
            baseCurrencyCode: userBaseCurrency,
            activeCapitalBaseCurrency: activeCapitalBase,
            currentValueBaseCurrency: currentValueBase,
            totalProfitBaseCurrency: totalProfitBase,
            investedCapitalBaseCurrency: investedCapitalBase,
            currencyBreakdownMap,
            hasUnrealizedAssetProfit: hasUnrealizedAsset,
          });
        }
      }

      // Convert to final format and calculate ROI
      const result: InstrumentSummary[] = Array.from(summaryMap.values()).map(item => {
        const currencyBreakdown = Array.from(item.currencyBreakdownMap.values());
        
        // ROI calculated from base currency
        const roi = item.investedCapitalBaseCurrency > 0
          ? (item.totalProfitBaseCurrency / item.investedCapitalBaseCurrency) * 100
          : null;

        return {
          instrumentId: item.instrumentId,
          instrumentName: item.instrumentName,
          unitLabel: item.unitLabel,
          // isTrackable based on presence of unrealized_asset_profit_base_currency
          isTrackable: item.hasUnrealizedAssetProfit || item.isTrackable,
          baseCurrencyCode: item.baseCurrencyCode,
          activeCapitalBaseCurrency: item.activeCapitalBaseCurrency,
          currentValueBaseCurrency: item.currentValueBaseCurrency,
          totalProfitBaseCurrency: item.totalProfitBaseCurrency,
          investedCapitalBaseCurrency: item.investedCapitalBaseCurrency,
          roi,
          currencyBreakdown,
          isMultiCurrency: currencyBreakdown.length > 1,
        };
      });

      // Sort by current value descending
      return result.sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency);
    },
    enabled: !!user,
  });
};

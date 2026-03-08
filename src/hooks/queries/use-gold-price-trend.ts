import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Granularity } from "./use-balance-trend";
import { ZAKAT_CONSTANTS } from "@/lib/zakat";
import { format, addDays, startOfMonth, startOfYear, endOfMonth, endOfYear, isToday, subDays } from "date-fns";

export type GoldPriceStatus = 'Exact' | 'Old' | 'Missing';

export interface GoldTrendItem {
  period_date: string;
  actual_date: string | null;
  nisab_value: number;
  status: GoldPriceStatus;
}

export const useGoldPriceTrend = (
  startDate: string,
  endDate: string,
  granularity: Granularity,
  baseCurrency: string
) => {
  return useQuery<GoldTrendItem[]>({
    queryKey: ["gold_price_trend", startDate, endDate, granularity, baseCurrency],
    queryFn: async () => {
      if (!baseCurrency) return [];

      // Primary query for the range
      const extendedStartTime = subDays(new Date(startDate), 7);
      const startStr = format(extendedStartTime, "yyyy-MM-dd");

      const { data: rangeData, error: rangeError } = await supabase
        .from("exchange_rates")
        .select("date, rate")
        .eq("from_currency", "XAU")
        .eq("to_currency", baseCurrency)
        .gte("date", startStr)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (rangeError) {
        console.error("Error fetching gold price trend range:", rangeError);
        throw rangeError;
      }

      // Secondary query for the latest rate BEFORE the extended range
      // (This handles cases where the user picks a range with no recent data)
      const { data: beforeData, error: beforeError } = await supabase
        .from("exchange_rates")
        .select("date, rate")
        .eq("from_currency", "XAU")
        .eq("to_currency", baseCurrency)
        .lt("date", startStr)
        .order("date", { ascending: false })
        .limit(1);

      if (beforeError) {
        console.error("Error fetching gold price before range:", beforeError);
      }

      const goldRates = [...(beforeData || []), ...(rangeData || [])].sort((a, b) => a.date.localeCompare(b.date));

      // Helper function to get rate for a specific date (or latest before it)
      const getRateForDate = (targetDate: string) => {
        const exactMatch = goldRates.find(r => r.date === targetDate);
        if (exactMatch) return { rate: exactMatch.rate, actual_date: exactMatch.date, status: 'Exact' as GoldPriceStatus };

        // Find the latest rate that is < targetDate
        const earlierRates = goldRates.filter(r => r.date < targetDate);
        if (earlierRates.length > 0) {
          const latest = earlierRates[earlierRates.length - 1];
          return { rate: latest.rate, actual_date: latest.date, status: 'Old' as GoldPriceStatus };
        }

        return { rate: 0, actual_date: null, status: 'Missing' as GoldPriceStatus };
      };

      // Generate the periods
      const result: GoldTrendItem[] = [];
      let current = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      const yesterday = subDays(today, 1);

      while (current <= end) {
        let periodEnd: Date;
        if (granularity === 'day') {
          periodEnd = current;
        } else if (granularity === 'month') {
          periodEnd = endOfMonth(current);
          if (isToday(periodEnd) || periodEnd > today) {
            periodEnd = yesterday;
          }
        } else { // year
          periodEnd = endOfYear(current);
          if (isToday(periodEnd) || periodEnd > today) {
            periodEnd = yesterday;
          }
        }

        const dateToUse = periodEnd > end ? end : periodEnd;
        const formattedDate = format(dateToUse, "yyyy-MM-dd");

        const rateData = getRateForDate(formattedDate);

        result.push({
          period_date: formattedDate,
          actual_date: rateData.actual_date,
          nisab_value: rateData.rate * ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS,
          status: rateData.status,
        });

        // Move to next period
        if (granularity === 'day') {
          current = addDays(current, 1);
        } else if (granularity === 'month') {
          current = startOfMonth(addDays(endOfMonth(current), 1));
        } else {
          current = startOfYear(addDays(endOfYear(current), 1));
        }
      }

      return result;
    },
    enabled: !!startDate && !!endDate && !!baseCurrency,
  });
};

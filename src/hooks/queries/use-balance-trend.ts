import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DailyCumulative } from "@/models/daily-cumulative";

export type Granularity = 'day' | 'month';

export interface BalanceTrendItem {
  period_date: string;
  total_balance: number;
}

/**
 * Utility to fetch all rows from a Supabase RPC or Query by handling the 1000-row limit.
 */
async function fetchAllRows<T = any>(
  query: any,
  pageSize: number = 1000
): Promise<T[]> {
  let allData: T[] = [];
  let from = 0;
  let to = pageSize - 1;
  let finished = false;

  while (!finished) {
    const { data, error } = await query.range(from, to);

    if (error) {
      console.error("Error in fetchAllRows:", error);
      throw error;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      if (data.length < pageSize) {
        finished = true;
      } else {
        from += pageSize;
        to += pageSize;
      }
    } else {
      finished = true;
    }
  }

  return allData;
}

export const useBalanceTrend = (
  startDate: string,
  endDate: string,
  granularity: Granularity
) => {
  const { user } = useAuth();

  return useQuery<BalanceTrendItem[]>({
    queryKey: ["balance_trend", user?.id, startDate, endDate, granularity],
    queryFn: async () => {
      if (!user?.id) return [];

      // Call the simplified RPC that handles all the gap-filling and cumulative logic on the backend
      const query = supabase
        .from("daily_cumulative")
        .select("*")
        .eq("user_id", user.id)
        .gte("movement_date", startDate)
        .lte("movement_date", endDate)
        .order("movement_date", { ascending: true });

      const data = await fetchAllRows(query);

      // Even though the RPC handles gaps, it might return multiple rows per date (for different assets/wallets)
      // depending on how it's implemented. We aggregate by movement_date just in case.
      const dailyMap = new Map<string, number>();

      const walletMap = new Map<string, number>();
      data.forEach((item: DailyCumulative) => {
        const date = item.movement_date;
        if (!date) return;

        const currentValue = item.historical_current_value_base_currency || 0;
        const key = item.wallet_name + "@" + item.movement_date
        walletMap.set(key, (walletMap.get(key) || 0) + currentValue);
        dailyMap.set(date, (dailyMap.get(date) || 0) + currentValue);
      });

      console.log("walletMap", walletMap);

      // Transform to BalanceTrendItem array and sort by date
      return Array.from(dailyMap.entries())
        .map(([date, total]) => ({
          period_date: date,
          total_balance: total
        }))
        .sort((a, b) => a.period_date.localeCompare(b.period_date));
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};

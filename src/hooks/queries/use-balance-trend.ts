import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DailyCumulative } from "@/models/daily-cumulative";

export type Granularity = 'day' | 'month' | 'year';

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
      // Build the query
      let query = supabase
        .from("daily_cumulative")
        .select("*")
        .eq("user_id", user.id)
        .order("movement_date", { ascending: true });

      if (granularity === 'day') {
        query = query
          .gte("movement_date", startDate)
          .lte("movement_date", endDate);
      } else {
        // For other granularities, we only want the last date of each period
        const periodEndDates: string[] = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        while (current <= end) {
          let periodEnd: Date;
          if (granularity === 'month') {
            periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

            // If the calculated period end is in the same month and year as today, use yesterday
            if (periodEnd.getFullYear() === today.getFullYear() &&
              periodEnd.getMonth() === today.getMonth()) {
              periodEnd = yesterday;
            }
          } else { // year
            periodEnd = new Date(current.getFullYear(), 11, 31);

            // If the calculated period end is in the same year as today, use yesterday
            if (periodEnd.getFullYear() === today.getFullYear()) {
              periodEnd = yesterday;
            }
          }

          // Ensure we don't go beyond the requested end date
          const dateToPush = periodEnd > end ? end : periodEnd;
          const formattedDate = dateToPush.toLocaleString().split(',')[0];

          if (!periodEndDates.includes(formattedDate)) {
            periodEndDates.push(formattedDate);
          }

          // Move to next period
          if (granularity === 'month') {
            current.setMonth(current.getMonth() + 1);
            current.setDate(1);
          } else { // year
            current.setFullYear(current.getFullYear() + 1);
            current.setMonth(0);
            current.setDate(1);
          }
        }

        query = query.in("movement_date", periodEndDates);
      }

      const data = await fetchAllRows(query);

      // Aggregate by movement_date
      const dailyMap = new Map<string, number>();

      data.forEach((item: DailyCumulative) => {
        const date = item.movement_date;
        if (!date) return;

        const currentValue = item.historical_current_value_base_currency || 0;
        dailyMap.set(date, (dailyMap.get(date) || 0) + currentValue);
      });

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

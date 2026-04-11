import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export type PerformanceGranularity = "month";

export interface PerformanceDataPoint {
  date: string;
  label: string;
  [assetKey: string]: number | string;
}

export interface PortfolioPerformanceResult {
  data: PerformanceDataPoint[];
  seriesKeys: string[];
}

interface DailyCumulativeRow {
  movement_date: string | null;
  asset_id: number | null;
  asset_name: string | null;
  historical_current_value_base_currency: number | null;
  cumulative_amount: number | null;
  historical_fx_rate: number | null;
  original_currency_code: string | null;
  base_currency_code: string | null;
}

/**
 * Fetch all rows from a Supabase query by paginating through the 1000-row limit.
 */
async function fetchAllRows<T = DailyCumulativeRow>(query: any, pageSize = 1000): Promise<T[]> {
  let allData: T[] = [];
  let from = 0;
  let finished = false;

  while (!finished) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      finished = data.length < pageSize;
      from += pageSize;
    } else {
      finished = true;
    }
  }

  return allData;
}

/**
 * Compute period end dates (last day of each month) for monthly granularity,
 * matching the logic in use-balance-trend.ts.
 */
function computeMonthlyPeriodEndDates(startDate: string, endDate: string): string[] {
  const periodEndDates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  while (current <= end) {
    let periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    // Use yesterday if period end falls in the current month
    if (
      periodEnd.getFullYear() === today.getFullYear() &&
      periodEnd.getMonth() === today.getMonth()
    ) {
      periodEnd = yesterday;
    }

    // Cap at requested end date
    const dateToPush = periodEnd > end ? end : periodEnd;
    const formatted = dateToPush.toDateString();

    if (!periodEndDates.includes(formatted)) {
      periodEndDates.push(formatted);
    }

    current.setMonth(current.getMonth() + 1);
    current.setDate(1);
  }

  return periodEndDates;
}

function computeModalAktif(row: DailyCumulativeRow): number {
  const amount = row.cumulative_amount ?? 0;
  if (!row.original_currency_code || !row.base_currency_code) return amount;
  if (row.original_currency_code === row.base_currency_code) return amount;
  return amount * (row.historical_fx_rate ?? 0);
}

/**
 * Aggregate day-level entries into month-level by taking the last value per month.
 */
function aggregateByMonth(entries: [string, number][]): [string, number][] {
  const monthMap = new Map<string, number>();
  for (const [date, value] of entries) {
    const monthKey = date.slice(0, 7);
    monthMap.set(monthKey, value);
  }
  return Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Forward-fill monthly entries to endDate month using the last known value.
 * Ensures all months in range are represented.
 */
function forwardFillMonthly(
  entries: [string, number][],
  endDate: string
): [string, number][] {
  if (entries.length === 0) return [];

  const endMonth = endDate.slice(0, 7);
  const result: [string, number][] = [...entries];

  let lastValue = entries[entries.length - 1][1];
  const [lastYearStr, lastMonthStr] = entries[entries.length - 1][0].split("-");
  let y = parseInt(lastYearStr, 10);
  let m = parseInt(lastMonthStr, 10);

  // Advance one month
  m++;
  if (m > 12) { m = 1; y++; }
  let currentMonth = `${y}-${String(m).padStart(2, "0")}`;

  while (currentMonth <= endMonth) {
    result.push([currentMonth, lastValue]);
    m++;
    if (m > 12) { m = 1; y++; }
    currentMonth = `${y}-${String(m).padStart(2, "0")}`;
  }

  return result;
}

function formatLabel(date: string, granularity: PerformanceGranularity): string {
  try {
    const parsed = parseISO(granularity === "month" ? `${date}-01` : date);
    if (granularity === "month") {
      return format(parsed, "MMM yyyy", { locale: id });
    }
    return format(parsed, "dd MMM", { locale: id });
  } catch {
    return date;
  }
}

export const usePortfolioPerformance = (
  startDate: string,
  endDate: string,
  granularity: PerformanceGranularity
): UseQueryResult<PortfolioPerformanceResult> => {
  const { user } = useAuth();

  const queryKey = [
    "portfolio_performance",
    user?.id,
    startDate,
    endDate,
    granularity,
  ];

  return useQuery<PortfolioPerformanceResult>({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return { data: [], seriesKeys: [] };

      const baseSelect =
        "movement_date, asset_id, asset_name, historical_current_value_base_currency, cumulative_amount, historical_fx_rate, original_currency_code, base_currency_code";

      let baseQuery = supabase
        .from("daily_cumulative")
        .select(baseSelect)
        .not("goal_id", "is", null)
        .order("movement_date", { ascending: true });

      if (granularity === "month") {
        const periodEndDates = computeMonthlyPeriodEndDates(startDate, endDate);
        baseQuery = baseQuery.in("movement_date", periodEndDates);
      } else {
        baseQuery = baseQuery
          .gte("movement_date", startDate)
          .lte("movement_date", endDate);
      }

      const rows = await fetchAllRows(baseQuery);

      // Aggregate all assets by date — dual series: "Nilai Saat Ini" and "Modal Aktif"
      const valueMap = new Map<string, number>();
      const capitalMap = new Map<string, number>();

      for (const row of rows) {
        if (!row.movement_date) continue;
        const val = row.historical_current_value_base_currency ?? 0;
        const capital = computeModalAktif(row);

        // Skip rows where both are zero (closed/empty positions with no data)
        if (val === 0 && capital <= 0) continue;

        valueMap.set(row.movement_date, (valueMap.get(row.movement_date) ?? 0) + val);
        capitalMap.set(row.movement_date, (capitalMap.get(row.movement_date) ?? 0) + capital);
      }

      let valueEntries = Array.from(valueMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      let capitalEntries = Array.from(capitalMap.entries()).sort(([a], [b]) => a.localeCompare(b));

      // Aggregate to month keys and forward-fill to endDate
      valueEntries = aggregateByMonth(valueEntries);
      capitalEntries = aggregateByMonth(capitalEntries);
      valueEntries = forwardFillMonthly(valueEntries, endDate);
      capitalEntries = forwardFillMonthly(capitalEntries, endDate);

      // Filter out time points where total current value is 0
      const filteredValueMap = new Map(valueEntries.filter(([, v]) => v > 0));
      const filteredCapitalMap = new Map(capitalEntries);

      const allDates = Array.from(filteredValueMap.keys()).sort();

      const dataPoints: PerformanceDataPoint[] = allDates.map((date) => ({
        date,
        label: formatLabel(date, granularity),
        "Nilai Saat Ini": filteredValueMap.get(date) ?? 0,
        "Modal Aktif": filteredCapitalMap.get(date) ?? 0,
      }));

      return { data: dataPoints, seriesKeys: ["Nilai Saat Ini", "Modal Aktif"] };
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};

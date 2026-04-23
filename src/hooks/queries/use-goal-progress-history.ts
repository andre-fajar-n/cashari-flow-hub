import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";

export interface GoalProgressDataPoint {
  date: string;
  balance: number;
}

const PAGE_SIZE = 1000;

function computeMonthEndDates(firstDate: string): string[] {
  return eachMonthOfInterval({
    start: parseISO(firstDate),
    end: endOfMonth(new Date()),
  }).map((m) => format(endOfMonth(m), "yyyy-MM-dd"));
}

/** Fetches the full monthly history for one goal, starting from its first transaction. */
async function fetchGoalHistory(
  userId: string,
  goalId: number
): Promise<GoalProgressDataPoint[]> {
  // Find this goal's earliest transaction date
  const { data: minRow, error: minErr } = await supabase
    .from("daily_cumulative")
    .select("movement_date")
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .not("movement_date", "is", null)
    .gt("historical_current_value_base_currency", 0)
    .order("movement_date", { ascending: true })
    .limit(1)
    .single();

  if (minErr && minErr.code !== "PGRST116") throw minErr;
  if (!minRow?.movement_date) return [];

  const endDates = computeMonthEndDates(minRow.movement_date);

  // Paginated fetch of end-of-month rows
  const allRows: {
    movement_date: string | null;
    historical_current_value_base_currency: number | null;
  }[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("daily_cumulative")
      .select("movement_date, historical_current_value_base_currency")
      .eq("user_id", userId)
      .eq("goal_id", goalId)
      .in("movement_date", endDates)
      .order("movement_date", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  if (allRows.length === 0) return [];

  // Sum per date across wallet/instrument/asset rows
  const dateMap = new Map<string, number>();
  for (const row of allRows) {
    if (!row.movement_date) continue;
    const existing = dateMap.get(row.movement_date) ?? 0;
    dateMap.set(
      row.movement_date,
      existing + (row.historical_current_value_base_currency ?? 0)
    );
  }

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, balance]) => ({ date, balance }));
}

export const useGoalProgressHistoryAll = (goalIds: number[]) => {
  const { user } = useAuth();

  return useQuery<Record<number, GoalProgressDataPoint[]>>({
    queryKey: ["goal_progress_history_all", user?.id, goalIds],
    queryFn: async () => {
      if (!user?.id || goalIds.length === 0) return {};

      // Fetch each goal independently in parallel — each gets its own history start
      const entries = await Promise.all(
        goalIds.map(async (goalId) => {
          const history = await fetchGoalHistory(user.id, goalId);
          return [goalId, history] as [number, GoalProgressDataPoint[]];
        })
      );

      return Object.fromEntries(entries);
    },
    enabled: !!user && goalIds.length > 0,
  });
};

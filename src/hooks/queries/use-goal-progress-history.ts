import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { subDays, format } from "date-fns";

export interface GoalProgressDataPoint {
  date: string;
  balance: number;
}

export const useGoalProgressHistory = (goalId: number, startDate?: string) => {
  const { user } = useAuth();

  return useQuery<GoalProgressDataPoint[]>({
    queryKey: ["goal_progress_history", goalId, user?.id, startDate],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("daily_cumulative")
        .select("movement_date, cumulative_amount")
        .eq("user_id", user.id)
        .eq("goal_id", goalId)
        .order("movement_date", { ascending: true });

      if (startDate) {
        query = query.gte("movement_date", startDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Group by date, sum cumulative_amount across all (wallet/instrument/asset) rows
      const dateMap = new Map<string, number>();
      for (const row of data) {
        if (!row.movement_date) continue;
        const existing = dateMap.get(row.movement_date) ?? 0;
        dateMap.set(row.movement_date, existing + (row.cumulative_amount ?? 0));
      }

      return Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, balance]) => ({ date, balance }));
    },
    enabled: !!user && !!goalId,
  });
};

export const useGoalProgressHistoryAll = (goalIds: number[]) => {
  const { user } = useAuth();
  const startDate = format(subDays(new Date(), 365), "yyyy-MM-dd");

  return useQuery<Record<number, GoalProgressDataPoint[]>>({
    queryKey: ["goal_progress_history_all", user?.id, goalIds],
    queryFn: async () => {
      if (!user?.id || goalIds.length === 0) return {};

      const { data, error } = await supabase
        .from("daily_cumulative")
        .select("movement_date, cumulative_amount, goal_id")
        .eq("user_id", user.id)
        .in("goal_id", goalIds)
        .gte("movement_date", startDate)
        .order("movement_date", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return {};

      // Build per-goal date maps
      const goalDateMaps = new Map<number, Map<string, number>>();

      for (const row of data) {
        if (!row.movement_date || row.goal_id == null) continue;
        const gid = row.goal_id as number;
        if (!goalDateMaps.has(gid)) goalDateMaps.set(gid, new Map());
        const dateMap = goalDateMaps.get(gid)!;
        const existing = dateMap.get(row.movement_date) ?? 0;
        dateMap.set(row.movement_date, existing + (row.cumulative_amount ?? 0));
      }

      const result: Record<number, GoalProgressDataPoint[]> = {};
      for (const [gid, dateMap] of goalDateMaps.entries()) {
        result[gid] = Array.from(dateMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, balance]) => ({ date, balance }));
      }
      return result;
    },
    enabled: !!user && goalIds.length > 0,
  });
};

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CheckCircle2 } from "lucide-react";
import { useGoals } from "@/hooks/queries/use-goals";
import { useGoalProgressHistoryAll } from "@/hooks/queries/use-goal-progress-history";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import GoalProgressChart from "@/components/analytics/GoalProgressChart";

const TujuanTab = () => {
  const { data: goals, isLoading: isLoadingGoals } = useGoals();
  const { data: userSettings } = useUserSettings();
  const currencySymbol = userSettings?.currencies?.symbol ?? "";

  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const activeGoals = useMemo(
    () => (goals ?? []).filter((g) => g.is_active),
    [goals]
  );
  const allGoalIds = useMemo(() => activeGoals.map((g) => g.id), [activeGoals]);

  const { data: historyMap, isLoading: isLoadingHistory } =
    useGoalProgressHistoryAll(allGoalIds);

  const goalsToShow = useMemo(() => {
    if (selectedGoalId) {
      return activeGoals.filter((g) => g.id === selectedGoalId);
    }
    return activeGoals.slice(0, 4);
  }, [activeGoals, selectedGoalId]);

  if (isLoadingGoals) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 border mb-4">
          <Target className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground">Belum Ada Tujuan Aktif</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Tambahkan tujuan keuangan terlebih dahulu untuk melihat grafik progres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-foreground">Progres Tujuan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Riwayat tabungan aktual vs target untuk setiap tujuan keuangan.
          </p>
        </div>
        {activeGoals.length > 1 && (
          <Select
            value={selectedGoalId ? String(selectedGoalId) : "all"}
            onValueChange={(v) =>
              setSelectedGoalId(v === "all" ? null : parseInt(v))
            }
          >
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Pilih tujuan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tujuan (maks 4)</SelectItem>
              {activeGoals.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-4">
        {goalsToShow.map((goal) => (
          <GoalProgressChart
            key={goal.id}
            goal={goal}
            history={historyMap?.[goal.id] ?? []}
            isLoading={isLoadingHistory}
            currencySymbol={currencySymbol}
          />
        ))}
      </div>

      {(() => {
        const achieved = (goals ?? []).filter((g) => g.is_achieved);
        if (achieved.length === 0) return null;
        return (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {achieved.length} tujuan telah tercapai
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TujuanTab;

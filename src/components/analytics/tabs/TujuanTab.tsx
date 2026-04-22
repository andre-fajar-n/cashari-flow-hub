import { useMemo, useState } from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Target, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import { useGoals } from "@/hooks/queries/use-goals";
import { useGoalProgressHistoryAll } from "@/hooks/queries/use-goal-progress-history";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import GoalProgressChart from "@/components/analytics/GoalProgressChart";

const TujuanTab = () => {
  const { data: goals, isLoading: isLoadingGoals } = useGoals();
  const { data: userSettings } = useUserSettings();
  const currencySymbol = userSettings?.currencies?.symbol ?? "";

  const [selectedGoalIds, setSelectedGoalIds] = useState<Set<number>>(new Set());

  const activeGoals = useMemo(
    () => (goals ?? []).filter((g) => g.is_active),
    [goals]
  );
  const allGoalIds = useMemo(() => activeGoals.map((g) => g.id), [activeGoals]);

  const { data: historyMap, isLoading: isLoadingHistory } =
    useGoalProgressHistoryAll(allGoalIds);

  const goalsToShow = useMemo(() => {
    if (selectedGoalIds.size === 0) return activeGoals;
    return activeGoals.filter((g) => selectedGoalIds.has(g.id));
  }, [activeGoals, selectedGoalIds]);

  const toggleGoal = (id: number) => {
    setSelectedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
            Riwayat nilai aktual vs target untuk setiap tujuan keuangan.
          </p>
        </div>

        {activeGoals.length > 1 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed text-xs">
                <PlusCircledIcon className="mr-2 h-3.5 w-3.5" />
                Tujuan
                {selectedGoalIds.size > 0 && (
                  <>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    {selectedGoalIds.size > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedGoalIds.size} dipilih
                      </Badge>
                    ) : (
                      <div className="flex gap-1">
                        {activeGoals
                          .filter((g) => selectedGoalIds.has(g.id))
                          .map((g) => (
                            <Badge
                              key={g.id}
                              variant="secondary"
                              className="rounded-sm px-1 font-normal"
                            >
                              {g.name}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="end">
              <Command>
                <CommandInput placeholder="Cari tujuan..." className="text-xs" />
                <CommandList>
                  <CommandEmpty>Tidak ada tujuan.</CommandEmpty>
                  <CommandGroup>
                    {activeGoals.map((g) => {
                      const isSelected = selectedGoalIds.has(g.id);
                      return (
                        <CommandItem
                          key={g.id}
                          onSelect={() => toggleGoal(g.id)}
                          className="text-xs"
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary shrink-0",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </div>
                          <span className="truncate">{g.name}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedGoalIds.size > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => setSelectedGoalIds(new Set())}
                          className="justify-center text-center text-xs"
                        >
                          Hapus filter
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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

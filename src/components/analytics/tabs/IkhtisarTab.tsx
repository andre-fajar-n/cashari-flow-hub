import { useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  ArrowLeftRight,
  TrendingUp,
  PiggyBank,
  Target,
  LineChart,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { useCashFlowTrend } from "@/hooks/queries/use-cashflow-trend";
import { usePortfolioDistribution } from "@/hooks/queries/use-portfolio-distribution";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useBudgetSummary } from "@/hooks/queries/use-budget-summary";
import { useGoals } from "@/hooks/queries/use-goals";
import { calculateTotalSpentInBaseCurrency } from "@/lib/budget-summary";
import { formatAmountCurrency } from "@/lib/currency";
import { formatPercentage } from "@/lib/number";

interface IkhtisarTabProps {
  onNavigate: (tab: string) => void;
}

const IkhtisarTab = ({ onNavigate }: IkhtisarTabProps) => {
  const now = new Date();
  const startStr = format(startOfMonth(now), "yyyy-MM-dd");
  const endStr = format(endOfMonth(now), "yyyy-MM-dd");

  const { data: userSettings } = useUserSettings();
  const baseCurrency = userSettings?.base_currency_code;
  const baseCurrencySymbol = userSettings?.currencies?.symbol;

  const formatCurrency = (val: number) =>
    formatAmountCurrency(val, baseCurrency, baseCurrencySymbol);

  // Cash flow this month
  const { data: cashflowTrend, isLoading: isLoadingCashflow } = useCashFlowTrend(
    startStr,
    endStr,
    "monthly"
  );

  const totalIncome = cashflowTrend?.reduce((s, m) => s + m.income, 0) ?? 0;
  const totalExpense = cashflowTrend?.reduce((s, m) => s + m.expense, 0) ?? 0;
  const netCashFlow = totalIncome - totalExpense;
  const isPositiveNet = netCashFlow >= 0;

  // Goals
  const { data: goals } = useGoals();
  const activeGoals = useMemo(() => (goals ?? []).filter((g) => g.is_active), [goals]);
  const achievedGoals = useMemo(() => (goals ?? []).filter((g) => g.is_achieved), [goals]);

  // Portfolio
  const { data: distribution, isLoading: isLoadingPortfolio } = usePortfolioDistribution();
  const totalPortfolioValue = distribution?.totalCurrentValue ?? 0;

  // Budget health
  const { data: budgets, isLoading: isLoadingBudgets } = useBudgets();
  const { data: allBudgetSummary, isLoading: isLoadingBudgetSummary } = useBudgetSummary();

  const budgetHealth = useMemo(() => {
    if (!budgets || !allBudgetSummary) return null;

    const today = format(now, "yyyy-MM-dd");
    const activeBudgets = budgets.filter(
      (b) => b.start_date <= today && (b.end_date == null || b.end_date >= today)
    );

    if (activeBudgets.length === 0) return null;

    let totalLimit = 0;
    let totalSpent = 0;

    for (const budget of activeBudgets) {
      const summaries = allBudgetSummary.filter((s) => s.budget_id === budget.id);
      const calc = calculateTotalSpentInBaseCurrency(summaries);
      if (calc.can_calculate) {
        totalLimit += budget.amount;
        totalSpent += Math.abs(calc.total_spent ?? 0);
      }
    }

    const pct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    return { pct, totalLimit, totalSpent, activeCount: activeBudgets.length };
  }, [budgets, allBudgetSummary]);

  const budgetColor =
    (budgetHealth?.pct ?? 0) >= 100
      ? "text-rose-600"
      : (budgetHealth?.pct ?? 0) >= 80
        ? "text-amber-600"
        : "text-emerald-600";

  const budgetBg =
    (budgetHealth?.pct ?? 0) >= 100
      ? "border-rose-100 bg-rose-50/60"
      : (budgetHealth?.pct ?? 0) >= 80
        ? "border-amber-100 bg-amber-50/60"
        : "border-emerald-100 bg-emerald-50/60";

  const budgetBarColor =
    (budgetHealth?.pct ?? 0) >= 100
      ? "bg-rose-500"
      : (budgetHealth?.pct ?? 0) >= 80
        ? "bg-amber-400"
        : "bg-emerald-500";

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ringkasan metrik keuangan bulan ini. Klik kartu untuk melihat detail di tab masing-masing.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Arus Kas Mini-Card */}
        <button
          className="text-left"
          onClick={() => onNavigate("arus-kas")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Arus Kas Bulan Ini</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {isLoadingCashflow ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold tabular-nums ${isPositiveNet ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPositiveNet ? "+" : ""}{formatCurrency(netCashFlow)}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUpCircle className="h-3 w-3 text-emerald-500" />
                      {formatCurrency(totalIncome)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDownCircle className="h-3 w-3 text-rose-500" />
                      {formatCurrency(totalExpense)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </button>

        {/* Portofolio Mini-Card */}
        <button
          className="text-left"
          onClick={() => onNavigate("portofolio")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <TrendingUp className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Nilai Portofolio</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {isLoadingPortfolio ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold tabular-nums text-violet-700">
                    {formatCurrency(totalPortfolioValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {distribution?.goalAllocation.length ?? 0} tujuan investasi
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </button>

        {/* Kesehatan Anggaran Mini-Card */}
        <button
          className="text-left"
          onClick={() => onNavigate("arus-kas")}
        >
          <Card className={`hover:border-primary/40 hover:shadow-md transition-all cursor-pointer border ${budgetBg}`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <PiggyBank className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Kesehatan Anggaran</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {isLoadingBudgets || isLoadingBudgetSummary ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : budgetHealth ? (
                <>
                  <div className={`text-2xl font-bold tabular-nums ${budgetColor}`}>
                    {formatPercentage(budgetHealth.pct)}%
                    {budgetHealth.pct >= 100 && (
                      <AlertTriangle className="inline h-5 w-5 ml-2 text-rose-500" />
                    )}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${budgetBarColor}`}
                      style={{ width: `${Math.min(budgetHealth.pct, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {budgetHealth.activeCount} anggaran aktif ·{" "}
                    {formatCurrency(budgetHealth.totalSpent)} dari{" "}
                    {formatCurrency(budgetHealth.totalLimit)}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada anggaran aktif</p>
              )}
            </CardContent>
          </Card>
        </button>

        {/* Tujuan Mini-Card */}
        <button
          className="text-left"
          onClick={() => onNavigate("tujuan")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Target className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Tujuan Keuangan</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold tabular-nums text-amber-700">
                {activeGoals.length}
                <span className="text-sm font-normal text-muted-foreground ml-1">aktif</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {achievedGoals.length > 0
                  ? `${achievedGoals.length} tujuan telah tercapai`
                  : "Lihat progres di tab Tujuan →"}
              </div>
            </CardContent>
          </Card>
        </button>

        {/* Tren Saldo Mini-Card */}
        <button
          className="text-left sm:col-span-2"
          onClick={() => onNavigate("tren-saldo")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <LineChart className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground">Tren Saldo</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lihat grafik tren saldo wallet dan portofolio Anda dari waktu ke waktu.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  );
};

export default IkhtisarTab;

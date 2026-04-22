import { useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  ArrowLeftRight,
  TrendingUp,
  Target,
  LineChart,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { useCashFlowTrend } from "@/hooks/queries/use-cashflow-trend";
import { usePortfolioDistribution } from "@/hooks/queries/use-portfolio-distribution";
import { useGoals } from "@/hooks/queries/use-goals";
import { formatAmountCurrency } from "@/lib/currency";

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

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ringkasan metrik keuangan bulan ini. Klik kartu untuk melihat detail di tab masing-masing.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {/* Arus Kas Mini-Card */}
        <button
          className="text-left h-full"
          onClick={() => onNavigate("arus-kas")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
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
          className="text-left h-full"
          onClick={() => onNavigate("portofolio")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
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

        {/* Tujuan Mini-Card */}
        <button
          className="text-left h-full"
          onClick={() => onNavigate("tujuan")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
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
          className="text-left h-full"
          onClick={() => onNavigate("tren-saldo")}
        >
          <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <LineChart className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Tren Saldo</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <div className="text-2xl font-bold text-indigo-700">→</div>
              <div className="text-xs text-muted-foreground">
                Lihat grafik tren saldo wallet dan portofolio dari waktu ke waktu.
              </div>
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  );
};

export default IkhtisarTab;

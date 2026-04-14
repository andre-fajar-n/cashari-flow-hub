import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDownCircle, ArrowUpCircle, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatAmountCurrency } from "@/lib/currency";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { useCashFlowTrend } from "@/hooks/queries/use-cashflow-trend";
import { useCategorySpending } from "@/hooks/queries/use-category-spending";
import PeriodFilter, { PeriodType } from "@/components/analytics/PeriodFilter";
import CashFlowBarChart from "@/components/analytics/CashFlowBarChart";
import CategorySpendingChart from "@/components/analytics/CategorySpendingChart";

const ArusKasTab = () => {
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [startDate, setStartDate] = useState<Date>(
    startOfMonth(subMonths(new Date(), 5))
  );
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const handlePeriodChange = (type: PeriodType, start: Date, end: Date) => {
    setPeriodType(type);
    setStartDate(start);
    setEndDate(end);
  };

  const { data: userSettings } = useUserSettings();
  const baseCurrency = userSettings?.base_currency_code;
  const baseCurrencySymbol = userSettings?.currencies?.symbol;

  const formatCurrency = (val: number) =>
    formatAmountCurrency(val, baseCurrency, baseCurrencySymbol);

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data: cashflowTrend, isLoading: isLoadingTrend } = useCashFlowTrend(
    startStr,
    endStr,
    periodType
  );
  const { data: categorySpending, isLoading: isLoadingCategory } =
    useCategorySpending(startStr, endStr);

  const totalIncome =
    cashflowTrend?.reduce((sum, m) => sum + m.income, 0) ?? 0;
  const totalExpense =
    cashflowTrend?.reduce((sum, m) => sum + m.expense, 0) ?? 0;
  const netCashFlow = totalIncome - totalExpense;
  const isPositiveNet = netCashFlow >= 0;

  const isLoadingSummary = isLoadingTrend;

  return (
    <div className="space-y-6">
      <PeriodFilter
        onPeriodChange={handlePeriodChange}
        initialType={periodType}
        initialStart={startDate}
        initialEnd={endDate}
      />

      {/* Summary cards */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Pemasukan */}
          <Card className="border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-none">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 cursor-help">
                          Total Pemasukan
                          <HelpCircle className="w-2.5 h-2.5 shrink-0" />
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs">
                          Jumlah total pemasukan selama periode yang dipilih.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-base font-bold leading-tight truncate tabular-nums text-emerald-600 mt-2">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Pengeluaran */}
          <Card className="border border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-none">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 cursor-help">
                          Total Pengeluaran
                          <HelpCircle className="w-2.5 h-2.5 shrink-0" />
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs">
                          Jumlah total pengeluaran selama periode yang dipilih.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-base font-bold leading-tight truncate tabular-nums text-rose-600 mt-2">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50">
                  <ArrowDownCircle className="h-4 w-4 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arus Kas Bersih */}
          <Card
            className={cn(
              "border shadow-none",
              isPositiveNet
                ? "border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20"
            )}
          >
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 cursor-help">
                          Arus Kas Bersih
                          <HelpCircle className="w-2.5 h-2.5 shrink-0" />
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs">
                          Selisih antara total pemasukan dan pengeluaran. Positif berarti surplus, negatif berarti defisit.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p
                    className={cn(
                      "text-base font-bold leading-tight truncate tabular-nums mt-2",
                      isPositiveNet ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {formatCurrency(netCashFlow)}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isPositiveNet
                      ? "bg-emerald-100 dark:bg-emerald-900/50"
                      : "bg-rose-100 dark:bg-rose-900/50"
                  )}
                >
                  {isPositiveNet ? (
                    <TrendingUp
                      className={cn(
                        "h-4 w-4",
                        isPositiveNet ? "text-emerald-600" : "text-rose-600"
                      )}
                    />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bar chart */}
      <CashFlowBarChart
        data={cashflowTrend ?? []}
        isLoading={isLoadingTrend}
        formatCurrency={formatCurrency}
      />

      {/* Category spending donut */}
      <CategorySpendingChart
        data={categorySpending?.categories ?? []}
        transactionsByCategory={
          categorySpending?.transactionsByCategory ?? {}
        }
        isLoading={isLoadingCategory}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default ArusKasTab;

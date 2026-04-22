import { ArrowDownRight, ArrowUpRight, HelpCircle, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlowMonth } from "@/hooks/queries/use-cashflow-month";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { formatAmountCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";
import { MoneySummaryModel } from "@/models/money-summary";

const DashboardSupportingCards = () => {
  const { data: cashFlow, isLoading: isCashFlowLoading } = useCashFlowMonth();
  const { data: moneySummaries, isLoading: isMoneyLoading } = useMoneySummary();
  const { data: userSettings } = useUserSettings();

  const baseCurrency = userSettings?.base_currency_code;
  const baseCurrencySymbol = userSettings?.currencies?.symbol;

  const formatAmount = (val: number) =>
    formatAmountCurrency(val, baseCurrency, baseCurrencySymbol);

  // Total wallet balance (no investment — goal_id is null)
  const totalWalletBalance = useMemo(() => {
    if (!moneySummaries) return 0;
    return moneySummaries
      .filter((m: MoneySummaryModel) => !m.goal_id)
      .reduce((sum: number, m: MoneySummaryModel) => sum + (m.current_value_base_currency || 0), 0);
  }, [moneySummaries]);

  // Total investment balance (goal_id is not null)
  const totalInvestmentBalance = useMemo(() => {
    if (!moneySummaries) return 0;
    return moneySummaries
      .filter((m: MoneySummaryModel) => !!m.goal_id)
      .reduce((sum: number, m: MoneySummaryModel) => sum + (m.current_value_base_currency || 0), 0);
  }, [moneySummaries]);

  const cashFlowIsPositive = (cashFlow?.netCashFlow ?? 0) >= 0;

  const today = new Date();
  const monthLabel = format(today, "MMMM yyyy", { locale: id });

  const cards = [
    {
      key: "cashflow",
      label: "Arus Kas Bulan Ini",
      tooltip: `Pemasukan dikurangi pengeluaran untuk bulan ${monthLabel}. Tidak termasuk transaksi investasi.`,
      isLoading: isCashFlowLoading,
      value: cashFlow ? formatAmount(cashFlow.netCashFlow) : "-",
      sub: cashFlow
        ? `+${formatAmount(cashFlow.totalIncome)} / -${formatAmount(cashFlow.totalExpense)}`
        : null,
      icon: cashFlowIsPositive ? ArrowUpRight : ArrowDownRight,
      iconBg: cashFlowIsPositive ? "bg-emerald-100" : "bg-rose-100",
      iconColor: cashFlowIsPositive ? "text-emerald-600" : "text-rose-600",
      valueColor: cashFlowIsPositive ? "text-emerald-600" : "text-rose-600",
      cardClass: cashFlowIsPositive
        ? "border-emerald-100 bg-emerald-50/30"
        : "border-rose-100 bg-rose-50/30",
    },
    {
      key: "wallet",
      label: "Total Saldo Dompet",
      tooltip: "Jumlah total saldo semua dompet dalam mata uang dasar. Tidak termasuk investasi.",
      isLoading: isMoneyLoading,
      value: formatAmount(totalWalletBalance),
      sub: null,
      icon: Wallet,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-foreground",
      cardClass: "border-blue-100 bg-blue-50/30",
    },
    {
      key: "investment",
      label: "Total Saldo Investasi",
      tooltip: "Jumlah total nilai investasi dalam mata uang dasar berdasarkan tujuan keuangan aktif.",
      isLoading: isMoneyLoading,
      value: formatAmount(totalInvestmentBalance),
      sub: null,
      icon: TrendingUp,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      valueColor: "text-foreground",
      cardClass: "border-violet-100 bg-violet-50/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className={cn("border shadow-none", card.cardClass)}>
            <CardContent className="p-4">
              {card.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 cursor-help mb-2">
                            {card.label}
                            <HelpCircle className="w-2.5 h-2.5 shrink-0" />
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">{card.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p className={cn("text-lg font-bold tabular-nums leading-tight", card.valueColor)}>
                      {card.value}
                    </p>
                    {card.sub && (
                      <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                    )}
                  </div>
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", card.iconBg)}>
                    <Icon className={cn("h-4 w-4", card.iconColor)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardSupportingCards;

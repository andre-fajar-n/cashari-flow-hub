import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Wallet, ArrowUpRight, ArrowDownRight, Percent } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { formatPercentage } from "@/lib/number";
import { BalanceTrendItem } from "@/hooks/queries/use-balance-trend";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { cn } from "@/lib/utils/cn";

interface TrendSummaryCardsProps {
  data: BalanceTrendItem[];
  isLoading: boolean;
}

const TrendSummaryCards = ({ data, isLoading }: TrendSummaryCardsProps) => {
  const { data: userSettings } = useUserSettings();
  const baseCurrencyCode = userSettings?.base_currency_code;
  const baseCurrencySymbol = userSettings?.currencies?.symbol;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const startBalance = data.length > 0 ? data[0].total_balance : 0;
  const endBalance = data.length > 0 ? data[data.length - 1].total_balance : 0;
  const absoluteGrowth = endBalance - startBalance;
  const growthPercentage = startBalance !== 0 ? (absoluteGrowth / startBalance) * 100 : 0;

  const formatValue = (val: number) => {
    return formatAmountCurrency(val, baseCurrencyCode, baseCurrencySymbol);
  };

  const isPositive = absoluteGrowth > 0;
  const isNegative = absoluteGrowth < 0;
  const GrowthIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const growthColor = isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-muted-foreground";
  const growthBg = isPositive ? "bg-emerald-50 dark:bg-emerald-950/30" : isNegative ? "bg-rose-50 dark:bg-rose-950/30" : "bg-muted/30";
  const growthBorder = isPositive ? "border-emerald-100 dark:border-emerald-900/50" : isNegative ? "border-rose-100 dark:border-rose-900/50" : "border-border";
  const growthIconBg = isPositive ? "bg-emerald-100 dark:bg-emerald-900/50" : isNegative ? "bg-rose-100 dark:bg-rose-900/50" : "bg-muted";

  const cards = [
    {
      label: "Saldo Awal",
      value: formatValue(startBalance),
      icon: Wallet,
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/50 dark:bg-blue-950/20",
      border: "border-blue-100 dark:border-blue-900/50",
      valueColor: "text-foreground",
    },
    {
      label: "Saldo Akhir",
      value: formatValue(endBalance),
      icon: Wallet,
      iconBg: "bg-violet-100 dark:bg-violet-900/50",
      iconColor: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50/50 dark:bg-violet-950/20",
      border: "border-violet-100 dark:border-violet-900/50",
      valueColor: "text-foreground",
    },
    {
      label: "Pertumbuhan Absolut",
      value: formatValue(absoluteGrowth),
      icon: isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus,
      iconBg: growthIconBg,
      iconColor: growthColor,
      bg: growthBg,
      border: growthBorder,
      valueColor: growthColor,
    },
    {
      label: "Pertumbuhan (%)",
      value: `${absoluteGrowth >= 0 ? "+" : ""}${formatPercentage(growthPercentage)}%`,
      icon: Percent,
      iconBg: growthIconBg,
      iconColor: growthColor,
      bg: growthBg,
      border: growthBorder,
      valueColor: growthColor,
      suffix: <GrowthIcon className={cn("h-3.5 w-3.5", growthColor)} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={cn("border", card.border, card.bg, "shadow-none")}>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                    {card.label}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <p className={cn("text-base font-bold leading-tight truncate", card.valueColor)}>
                      {card.value}
                    </p>
                    {card.suffix}
                  </div>
                </div>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", card.iconBg)}>
                  <Icon className={cn("h-4 w-4", card.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TrendSummaryCards;

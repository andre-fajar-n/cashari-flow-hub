import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { formatPercentage } from "@/lib/number";
import { BalanceTrendItem } from "@/hooks/queries/use-balance-trend";
import { useUserSettings } from "@/hooks/queries/use-user-settings";

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
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

  const GrowthIcon = absoluteGrowth > 0 ? TrendingUp : absoluteGrowth < 0 ? TrendingDown : Minus;
  const growthColor = absoluteGrowth > 0 ? "text-emerald-600" : absoluteGrowth < 0 ? "text-rose-600" : "text-gray-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Saldo Awal</p>
          <p className="text-lg font-bold mt-1">{formatValue(startBalance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Saldo Akhir</p>
          <p className="text-lg font-bold mt-1">{formatValue(endBalance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Pertumbuhan Absolut</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-lg font-bold ${growthColor}`}>{formatValue(absoluteGrowth)}</span>
            <GrowthIcon className={`h-4 w-4 ${growthColor}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Persentase Pertumbuhan</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-lg font-bold ${growthColor}`}>
              {absoluteGrowth >= 0 ? "+" : ""}{formatPercentage(growthPercentage)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendSummaryCards;

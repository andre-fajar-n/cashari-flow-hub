import { useMemo, useState } from "react";
import {
  ReusableLineChart,
  ChartLineConfig
} from "@/components/ui/charts";
import { formatAmountCurrency } from "@/lib/currency";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { BalanceTrendItem, Granularity } from "@/hooks/queries/use-balance-trend";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import ValuationDetailModal from "@/components/analytics/ValuationDetailModal";
import { GoldTrendItem } from "@/hooks/queries/use-gold-price-trend";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Coins, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface BalanceTrendChartProps {
  data: BalanceTrendItem[];
  goldTrendData: GoldTrendItem[];
  granularity: Granularity;
  isLoadingGoldPrice?: boolean;
  isLoading?: boolean;
}

const BalanceTrendChart = ({ data, goldTrendData, granularity, isLoadingGoldPrice, isLoading }: BalanceTrendChartProps) => {
  const { data: userSettings } = useUserSettings();
  const baseCurrencyCode = userSettings?.base_currency_code;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGoldLine, setShowGoldLine] = useState(false);
  const [isGoldMode, setIsGoldMode] = useState(false);

  const chartData = useMemo(() => {
    return data.map((item) => {
      const date = parseISO(item.period_date);
      let label: string;

      if (granularity === 'year') {
        label = format(date, "yyyy", { locale: id });
      } else if (granularity === 'month') {
        label = format(date, "MMM yyyy", { locale: id });
      } else {
        label = format(date, "dd MMM", { locale: id });
      }

      const goldItem = goldTrendData.find(g => g.period_date === item.period_date);

      return {
        label,
        value: item.total_balance,
        goldValue: goldItem?.nisab_value ?? 0,
        goldStatus: goldItem?.status,
        fullDate: item.period_date,
        status: item.status,
      };
    });
  }, [data, goldTrendData, granularity]);

  const lines: ChartLineConfig[] = useMemo(() => {
    const configs: ChartLineConfig[] = [
      {
        dataKey: "value",
        name: "Total Saldo",
        stroke: "hsl(var(--primary))",
      },
    ];

    if (showGoldLine) {
      configs.push({
        dataKey: "goldValue",
        name: "Nisab Zakat (85g Emas)",
        stroke: "#f59e0b",
        strokeWidth: 2,
        dot: { r: 3, strokeWidth: 1 },
      });
    }

    return configs;
  }, [showGoldLine]);

  const formatCurrency = (value: number) => {
    return formatAmountCurrency(value, baseCurrencyCode, userSettings?.currencies?.symbol);
  };

  const handleDotClick = (item: any) => {
    setSelectedDate(item.fullDate);
    setIsGoldMode(item.dataKey === "goldValue");
    setIsModalOpen(true);
  };

  const customTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || payload.length === 0) return null;

    const item = payload[0].payload;
    const value = item.value;
    const goldValue = item.goldValue;

    return (
      <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3.5 shadow-xl">
        <p className="font-semibold mb-2.5 text-sm border-b pb-2">
          {granularity === 'year'
            ? format(parseISO(item.fullDate), "yyyy", { locale: id })
            : granularity === 'month'
              ? format(parseISO(item.fullDate), "MMMM yyyy", { locale: id })
              : format(parseISO(item.fullDate), "eeee, dd MMMM yyyy", { locale: id })
          }
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              <span className="text-xs text-muted-foreground">Total Saldo</span>
            </div>
            <span className="text-sm font-bold tabular-nums">{formatCurrency(value)}</span>
          </div>
          {showGoldLine && goldValue !== undefined && (
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs text-muted-foreground">Nisab Zakat</span>
              </div>
              <span className="text-sm font-bold tabular-nums">{formatCurrency(goldValue)}</span>
            </div>
          )}
        </div>
        <p className="mt-2.5 text-[10px] text-muted-foreground italic border-t pt-2">
          Klik titik untuk detail valuasi
        </p>
      </div>
    );
  };

  const yAxisMax = useMemo(() => {
    const balances = data.map(d => d.total_balance);
    const goldNisabs = showGoldLine ? goldTrendData.map(g => g.nisab_value) : [];
    const maxVal = Math.max(...balances, ...goldNisabs, 0);
    return maxVal * 1.1;
  }, [data, goldTrendData, showGoldLine]);

  return (
    <Card className="border bg-card shadow-none">
      <CardContent className="p-4">
        <div className="space-y-0">
          {/* Chart header row */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="text-sm font-semibold text-muted-foreground">Grafik Pertumbuhan Saldo</span>
        </div>

        {/* Gold toggle */}
        <div className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all",
          showGoldLine
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
            : "bg-muted/40 border-border"
        )}>
          <Coins className={cn("h-3.5 w-3.5 transition-colors", showGoldLine ? "text-amber-500" : "text-muted-foreground")} />
          <Label
            htmlFor="show-gold-line"
            className={cn("text-xs font-medium cursor-pointer transition-colors", showGoldLine ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}
          >
            Nisab Zakat
          </Label>
          {showGoldLine && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-300">
              85g Emas
            </Badge>
          )}
          <Switch
            id="show-gold-line"
            checked={showGoldLine}
            onCheckedChange={setShowGoldLine}
            disabled={isLoadingGoldPrice}
          />
        </div>
          </div>{/* end chart header row */}

      <ReusableLineChart
        data={chartData}
        isLoading={isLoadingGoldPrice || isLoading}
        lines={lines}
        height={380}
        xAxisDataKey="label"
        showLegend={showGoldLine}
        yAxisDomain={[0, yAxisMax]}
        yAxisFormatter={(val) => {
          if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
          if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
          return val.toString();
        }}
        customTooltip={customTooltip}
        onDotClick={handleDotClick}
        emptyMessage="Tidak ada data tren saldo"
        noPeriodDataMessage="Tidak ada data untuk periode ini"
      />

      <ValuationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        isGoldMode={isGoldMode}
      />
    </div>
      </CardContent>
    </Card>
  );
};

export default BalanceTrendChart;

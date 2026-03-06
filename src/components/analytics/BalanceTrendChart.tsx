import { useMemo } from "react";
import {
  ReusableLineChart,
  ChartLineConfig
} from "@/components/ui/charts";
import { formatAmountCurrency } from "@/lib/currency";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { BalanceTrendItem, Granularity } from "@/hooks/queries/use-balance-trend";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface BalanceTrendChartProps {
  data: BalanceTrendItem[];
  granularity: Granularity;
}

const BalanceTrendChart = ({ data, granularity }: BalanceTrendChartProps) => {
  const { data: userSettings } = useUserSettings();
  const baseCurrencyCode = userSettings?.base_currency_code;

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

      return {
        label,
        value: item.total_balance,
        fullDate: item.period_date,
      };
    });
  }, [data, granularity]);

  const lines: ChartLineConfig[] = [
    {
      dataKey: "value",
      name: "Total Saldo",
      stroke: "hsl(var(--primary))",
    },
  ];

  const formatCurrency = (value: number) => {
    return formatAmountCurrency(value, baseCurrencyCode, userSettings?.currencies?.symbol);
  };

  const customTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || payload.length === 0) return null;

    const item = payload[0].payload;
    const value = item.value;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-semibold mb-1 text-sm">
          {granularity === 'year'
            ? format(parseISO(item.fullDate), "yyyy", { locale: id })
            : granularity === 'month'
              ? format(parseISO(item.fullDate), "MMMM yyyy", { locale: id })
              : format(parseISO(item.fullDate), "eeee, dd MMMM yyyy", { locale: id })
          }
        </p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Total Saldo:</span>
          <span className="text-sm font-bold">{formatCurrency(value)}</span>
        </div>
      </div>
    );
  };

  return (
    <ReusableLineChart
      data={chartData}
      lines={lines}
      title="Grafik Pertumbuhan Saldo"
      height={350}
      xAxisDataKey="label"
      yAxisFormatter={(val) => {
        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
        if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
        return val.toString();
      }}
      customTooltip={customTooltip}
      emptyMessage="Tidak ada data tren saldo"
      noPeriodDataMessage="Tidak ada data untuk periode ini"
    />
  );
};

export default BalanceTrendChart;

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ReusableLineChart, PeriodType, filterDataByPeriod, ChartLineConfig } from "@/components/ui/charts";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { formatPercentage } from "@/lib/number";

interface AssetValueData {
  date: string;
  value: number;
}

interface AssetValueChartProps {
  data: AssetValueData[];
  currencyCode: string;
  currencySymbol: string;
  assetName: string;
}

const AssetValueChart = ({ data, currencyCode, currencySymbol, assetName }: AssetValueChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("ALL");

  const filteredData = useMemo(() => {
    return filterDataByPeriod(data, selectedPeriod);
  }, [data, selectedPeriod]);

  const chartData = useMemo(() => {
    return filteredData.map((item, index) => {
      const prevValue = index > 0 ? filteredData[index - 1].value : null;
      const change = prevValue !== null ? item.value - prevValue : null;
      const changePercent = prevValue !== null && prevValue !== 0
        ? ((item.value - prevValue) / prevValue) * 100
        : null;

      return {
        label: formatDate(item.date),
        value: item.value,
        fullDate: item.date,
        change,
        changePercent,
      };
    });
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    return formatAmountCurrency(value, currencyCode, currencySymbol, 4);
  };

  const lines: ChartLineConfig[] = [
    {
      dataKey: "value",
      name: "Nilai",
      stroke: "hsl(var(--primary))",
    },
  ];

  const customTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const value = data.value;
    const change = data.change;
    const changePercent = data.changePercent;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-semibold mb-2">{formatDate(data.fullDate)}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Nilai:</span>
            <span className="font-medium">{formatCurrency(value)}</span>
          </div>
          {change !== null && (
            <div className="flex items-center justify-between gap-4 border-t pt-1 mt-1">
              <span className="text-muted-foreground">Perubahan:</span>
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                )}
                <span className={`font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {change >= 0 ? '+' : ''}{formatCurrency(change)}
                  {changePercent !== null && (
                    <span className="ml-1">
                      ({changePercent >= 0 ? '+' : ''}{formatPercentage(changePercent)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ReusableLineChart
      data={chartData}
      lines={lines}
      title={`Grafik Nilai ${assetName}`}
      titleIcon={<TrendingUp className="w-5 h-5" />}
      height={256}
      showPeriodSelector
      selectedPeriod={selectedPeriod}
      onPeriodChange={setSelectedPeriod}
      emptyMessage="Belum ada data nilai"
      noPeriodDataMessage="Tidak ada data untuk periode ini"
      yAxisDomain={['dataMin - dataMin * 0.05', 'dataMax + dataMax * 0.05']}
      customTooltip={customTooltip}
    />
  );
};

export default AssetValueChart;

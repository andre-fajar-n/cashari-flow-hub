import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { subDays, subMonths, subYears, parseISO, isAfter } from "date-fns";

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

type PeriodType = "1M" | "3M" | "6M" | "1Y" | "ALL";

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "Semua" },
];

const AssetValueChart = ({ data, currencyCode, currencySymbol, assetName }: AssetValueChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("ALL");

  const filteredData = useMemo(() => {
    if (selectedPeriod === "ALL" || data.length === 0) {
      return data;
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1M":
        cutoffDate = subDays(now, 30);
        break;
      case "3M":
        cutoffDate = subMonths(now, 3);
        break;
      case "6M":
        cutoffDate = subMonths(now, 6);
        break;
      case "1Y":
        cutoffDate = subYears(now, 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = parseISO(item.date);
      return isAfter(itemDate, cutoffDate);
    });
  }, [data, selectedPeriod]);

  const chartData = useMemo(() => {
    return filteredData.map((item, index) => {
      const prevValue = index > 0 ? filteredData[index - 1].value : null;
      const change = prevValue !== null ? item.value - prevValue : null;
      const changePercent = prevValue !== null && prevValue !== 0 
        ? ((item.value - prevValue) / prevValue) * 100 
        : null;
      
      return {
        date: formatDate(item.date),
        value: item.value,
        fullDate: item.date,
        change,
        changePercent,
      };
    });
  }, [filteredData]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Grafik Nilai {assetName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Belum ada data nilai
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return formatAmountCurrency(value, currencyCode, currencySymbol, 4);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Grafik Nilai {assetName}
        </CardTitle>
        <div className="flex gap-1">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(option.value)}
              className="h-7 px-2 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Tidak ada data untuk periode ini
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={['dataMin - dataMin * 0.05', 'dataMax + dataMax * 0.05']}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toFixed(0);
                  }}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) => {
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
                                      ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetValueChart;

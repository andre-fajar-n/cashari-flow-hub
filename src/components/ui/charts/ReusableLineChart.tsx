import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { ReusableLineChartProps, ChartLineConfig } from "./types";
import { periodOptions, defaultYAxisFormatter } from "./utils";
import { cn } from "@/lib/utils/cn";

const ReusableLineChart = ({
  data,
  lines,
  title,
  titleIcon,
  height = 256,
  showLegend = false,
  showPeriodSelector = false,
  selectedPeriod = "ALL",
  onPeriodChange,
  emptyMessage = "Belum ada data untuk ditampilkan",
  noPeriodDataMessage = "Tidak ada data untuk periode ini",
  xAxisDataKey = "label",
  yAxisDomain,
  yAxisWidth = 60,
  yAxisFormatter = defaultYAxisFormatter,
  customTooltip,
  legendFormatter,
  className,
}: ReusableLineChartProps) => {
  const isEmpty = data.length === 0;

  const renderLine = (config: ChartLineConfig) => {
    const {
      dataKey,
      name,
      stroke,
      strokeWidth = 2.5,
      strokeDasharray,
      dot = { fill: stroke, strokeWidth: 2, r: 4 },
      activeDot = { r: 6, strokeWidth: 2 },
    } = config;

    return (
      <Line
        key={dataKey}
        type="monotone"
        dataKey={dataKey}
        name={name}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        dot={{ fill: dot.fill || stroke, strokeWidth: dot.strokeWidth, r: dot.r }}
        activeDot={{ r: activeDot.r, strokeWidth: activeDot.strokeWidth }}
      />
    );
  };

  return (
    <Card className={cn(className)}>
      {(title || showPeriodSelector) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {title && (
            <CardTitle className="flex items-center gap-2">
              {titleIcon || <TrendingUp className="w-5 h-5" />}
              {title}
            </CardTitle>
          )}
          {showPeriodSelector && onPeriodChange && (
            <div className="flex gap-1">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange(option.value)}
                  className="h-7 px-2 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent>
        {isEmpty ? (
          <div 
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            {showPeriodSelector && selectedPeriod !== "ALL" 
              ? noPeriodDataMessage 
              : emptyMessage}
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  vertical={false}
                />
                <XAxis
                  dataKey={xAxisDataKey}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={yAxisDomain}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yAxisFormatter}
                  width={yAxisWidth}
                />
                {customTooltip ? (
                  <Tooltip content={customTooltip} />
                ) : (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                )}
                {showLegend && (
                  <Legend
                    formatter={legendFormatter}
                  />
                )}
                {lines.map(renderLine)}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReusableLineChart;

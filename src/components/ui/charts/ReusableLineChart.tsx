import React from "react";
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
  onDotClick,
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

    const renderDot = (props: any): React.ReactElement | null => {
      const { cx, cy, payload } = props;
      if (cx === undefined || cy === undefined) return null;

      if (typeof dot === 'function') {
        const customDot = dot(props);
        if (customDot) {
          return React.cloneElement(customDot as React.ReactElement, {
            key: `dot-${dataKey}-${payload.fullDate || payload.label}`
          });
        }
        return null;
      }

      if (typeof dot === 'object' && dot !== null && !('$$typeof' in dot)) {
        const dotConfig = dot as { fill?: string; strokeWidth?: number; r?: number };
        const radius = dotConfig.r ?? 4;
        const sWidth = dotConfig.strokeWidth ?? 2;

        let fill = dotConfig.fill || stroke;
        let finalStroke = stroke;

        // Determine status based on dataKey
        const currentStatus = dataKey === 'goldValue' ? payload.goldStatus : payload.status;

        // Apply status-based coloring
        if (currentStatus === 'Missing') {
          fill = "#ef4444"; // red-500
          finalStroke = fill;
        } else if (currentStatus === 'Old' || currentStatus === 'Warning') {
          fill = "#eab308"; // yellow-500
          finalStroke = fill;
        } else if (currentStatus === 'Exact') {
          fill = "#22c55e"; // green-500
          finalStroke = fill;
        }

        return (
          <g
            key={`dot-group-${dataKey}-${payload.fullDate || payload.label}`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDotClick?.({ ...payload, dataKey });
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={radius + 8}
              fill="transparent"
              style={{ pointerEvents: 'all' }}
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={fill}
              stroke={finalStroke}
              strokeWidth={sWidth}
              className={cn("transition-all hover:opacity-80")}
              style={{ pointerEvents: 'none' }}
            />
          </g>
        );
      }

      return React.cloneElement(dot as React.ReactElement, {
        key: `dot-${dataKey}-${payload.fullDate || payload.label}`
      });
    };

    // Correctly determine the activeDot prop for Recharts Line
    let activeDotProp: any = activeDot;
    if (typeof activeDot === 'object' && activeDot !== null && !('$$typeof' in activeDot)) {
      // It's a config object, pass it as is
      const activeConfig = activeDot as { r?: number; strokeWidth?: number };
      activeDotProp = { r: activeConfig.r ?? 6, strokeWidth: activeConfig.strokeWidth ?? 2 };
    }

    return (
      <Line
        key={dataKey}
        type="monotone"
        dataKey={dataKey}
        name={name}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        dot={renderDot}
        activeDot={activeDotProp}
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
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
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

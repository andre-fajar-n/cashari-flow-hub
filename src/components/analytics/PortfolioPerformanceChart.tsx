import { useMemo, useState } from "react";
import { format, subMonths, subYears, startOfDay, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ReusableLineChart, ChartLineConfig } from "@/components/ui/charts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  usePortfolioPerformance,
  PerformanceGranularity,
} from "@/hooks/queries/use-portfolio-performance";

interface PortfolioPerformanceChartProps {
  isLoading?: boolean;
  formatCurrency: (val: number) => string;
  baseCurrency?: string;
}

type RangeOption = "1M" | "3M" | "6M" | "1Y" | "Custom";

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "1M", label: "1 Bln" },
  { value: "3M", label: "3 Bln" },
  { value: "6M", label: "6 Bln" },
  { value: "1Y", label: "1 Thn" },
  { value: "Custom", label: "Kustom" },
];

// "Nilai Saat Ini" always primary, "Modal Aktif" always secondary muted
const DUAL_SERIES_COLORS: Record<string, string> = {
  "Nilai Saat Ini": "hsl(var(--primary))",
  "Modal Aktif": "#6b7280",
};

interface DateRangeResult {
  startDate: string;
  endDate: string;
  granularity: PerformanceGranularity;
}

function getPresetDateRange(range: Exclude<RangeOption, "Custom">): DateRangeResult {
  const today = startOfDay(new Date());
  const endDate = format(today, "yyyy-MM-dd");
  let startDate: string;
  const granularity: PerformanceGranularity = "month";

  switch (range) {
    case "1M":
      startDate = format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd");
      break;
    case "3M":
      startDate = format(startOfMonth(subMonths(today, 3)), "yyyy-MM-dd");
      break;
    case "6M":
      startDate = format(startOfMonth(subMonths(today, 6)), "yyyy-MM-dd");
      break;
    case "1Y":
    default:
      startDate = format(startOfMonth(subYears(today, 1)), "yyyy-MM-dd");
      break;
  }

  return { startDate, endDate, granularity };
}

function getCustomDateRange(range: DateRange): DateRangeResult | null {
  if (!range.from || !range.to) return null;
  const startDate = format(startOfMonth(range.from), "yyyy-MM-dd");
  const endDate = format(endOfMonth(range.to), "yyyy-MM-dd");
  return { startDate, endDate, granularity: "month" };
}

const PortfolioPerformanceChart = ({
  isLoading: externalLoading,
  formatCurrency,
}: PortfolioPerformanceChartProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("3M");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

  const dateRangeResult = useMemo((): DateRangeResult | null => {
    if (selectedRange === "Custom") {
      if (!customDateRange) return null;
      return getCustomDateRange(customDateRange);
    }
    return getPresetDateRange(selectedRange);
  }, [selectedRange, customDateRange]);

  const { startDate, endDate, granularity } = dateRangeResult ?? {
    startDate: "",
    endDate: "",
    granularity: "month" as PerformanceGranularity,
  };

  const { data: performanceData, isLoading: isLoadingPerformance } =
    usePortfolioPerformance(startDate, endDate, granularity);

  const isLoading = externalLoading || isLoadingPerformance;

  const lines: ChartLineConfig[] = useMemo(() => {
    if (!performanceData) return [];
    return performanceData.seriesKeys.map((key) => ({
      dataKey: key,
      name: key,
      stroke: DUAL_SERIES_COLORS[key] ?? "hsl(var(--primary))",
      strokeWidth: key === "Modal Aktif" ? 1.5 : 2.5,
      strokeDasharray: key === "Modal Aktif" ? "4 2" : undefined,
      dot: key === "Modal Aktif"
        ? () => null
        : { r: 3, strokeWidth: 1, fill: DUAL_SERIES_COLORS[key] ?? "hsl(var(--primary))" },
    }));
  }, [performanceData]);

  const isCustomReady =
    selectedRange !== "Custom" ||
    (customDateRange?.from != null && customDateRange?.to != null);

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-primary/70 shrink-0" />
          Performa Portofolio
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Range pills */}
        <div className="flex flex-wrap gap-1.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedRange(opt.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-all",
                selectedRange === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom date range picker */}
        {selectedRange === "Custom" && (
          <div className="max-w-xs">
            <DateRangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
              placeholder="Pilih bulan"
              mode="monthly"
            />
          </div>
        )}

        {/* Line chart */}
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : !isCustomReady ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Pilih rentang bulan untuk melihat data</p>
          </div>
        ) : (
          <ReusableLineChart
            data={performanceData?.data ?? []}
            lines={lines}
            height={300}
            xAxisDataKey="label"
            showLegend={lines.length > 1}
            yAxisFormatter={(val) => {
              if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
              if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`;
              if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
              return val.toString();
            }}
            customTooltip={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl space-y-1.5 min-w-[180px]">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
                  {payload.map((entry: { name: string; value: number; color: string }) => (
                    <div key={entry.name} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {formatCurrency(entry.value)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
            emptyMessage="Belum ada data performa portofolio"
            noPeriodDataMessage="Tidak ada data untuk periode ini"
            className="border-0 shadow-none p-0"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioPerformanceChart;

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PieChart as PieChartIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import {
  CategorySpendingItem,
  CategoryTransaction,
} from "@/hooks/queries/use-category-spending";

interface CategorySpendingChartProps {
  data: CategorySpendingItem[];
  transactionsByCategory: Record<string, CategoryTransaction[]>;
  isLoading?: boolean;
  formatCurrency: (val: number) => string;
}

const CHART_COLORS = [
  "#10b981", // emerald
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f97316", // orange
  "#14b8a6", // teal
  "#6b7280", // gray
];

interface ChartDatum {
  name: string;
  value: number;
}

type CustomTooltipProps = TooltipProps<number, string> & {
  formatCurrency: (val: number) => string;
};

const CustomTooltip = ({ active, payload, formatCurrency }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload as ChartDatum;

  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="font-semibold text-sm mb-1">{item.name}</p>
      <p className="text-sm font-bold tabular-nums text-rose-600">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
};

const CategorySpendingChart = ({
  data,
  transactionsByCategory,
  isLoading,
  formatCurrency,
}: CategorySpendingChartProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="border bg-card shadow-none">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-52" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border bg-card shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <PieChartIcon className="h-4 w-4 text-primary/70 shrink-0" />
            Pengeluaran per Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada pengeluaran untuk periode ini
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData: ChartDatum[] = data.map((cat) => ({
    name: cat.categoryName,
    value: cat.total,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
  }: {
    cx: number; cy: number; midAngle: number;
    innerRadius: number; outerRadius: number; percent: number;
  }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const handleSliceClick = (entry: ChartDatum) => {
    setSelectedCategory(entry.name);
  };

  const getModalTransactions = (): CategoryTransaction[] => {
    return transactionsByCategory[selectedCategory ?? ""] ?? [];
  };

  const modalTransactions = getModalTransactions();
  const modalTotal = modalTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  return (
    <>
      <Card className="border bg-card shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <PieChartIcon className="h-4 w-4 text-primary/70 shrink-0" />
            Pengeluaran per Kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Klik segmen untuk melihat detail transaksi
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pie chart */}
            <div className="shrink-0 w-full md:w-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                    onClick={(entry: ChartDatum) => handleSliceClick(entry)}
                    style={{ cursor: "pointer" }}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload as CustomTooltipProps["payload"]}
                        formatCurrency={formatCurrency}
                      />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <div className="flex-1 overflow-y-auto max-h-[260px] space-y-1 pr-1">
              {chartData.map((entry, index) => {
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                const color = CHART_COLORS[index % CHART_COLORS.length];
                return (
                  <button
                    key={index}
                    onClick={() => handleSliceClick(entry)}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs text-foreground flex-1 truncate">{entry.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">{pct}%</span>
                    <span className="text-xs font-medium tabular-nums text-rose-600 shrink-0">
                      {formatCurrency(entry.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedCategory}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null);
        }}
      >
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Pengeluaran: {selectedCategory}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {modalTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tidak ada transaksi
              </p>
            ) : (
              <div className="space-y-0">
                {modalTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 border-b last:border-b-0 gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {format(parseISO(tx.date), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </p>
                      <p className="text-sm text-foreground truncate mt-0.5">
                        ({tx.categoryName}){tx.description === "" || tx.description === null ? "" : ` - ${tx.description}`}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums shrink-0",
                        "text-rose-600"
                      )}
                    >
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}

                {/* Total row */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t">
                  <p className="text-sm font-semibold text-foreground">
                    Total
                  </p>
                  <p className="text-sm font-bold tabular-nums text-rose-600">
                    {formatCurrency(modalTotal)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategorySpendingChart;

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

const TOP_N = 8;

interface ChartDatum {
  name: string;
  value: number;
  originalNames: string[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: ChartDatum }>;
  formatCurrency: (val: number) => string;
}

const CustomTooltip = ({ active, payload, formatCurrency }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

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

  // Build chart data: top N categories + "Lainnya"
  const topCategories = data.slice(0, TOP_N);
  const remainder = data.slice(TOP_N);

  const chartData: ChartDatum[] = topCategories.map((cat) => ({
    name: cat.categoryName,
    value: cat.total,
    originalNames: [cat.categoryName],
  }));

  if (remainder.length > 0) {
    chartData.push({
      name: "Lainnya",
      value: remainder.reduce((sum, c) => sum + c.total, 0),
      originalNames: remainder.map((c) => c.categoryName),
    });
  }

  const selectedTransactions = selectedCategory
    ? transactionsByCategory[selectedCategory] ?? []
    : [];

  const selectedTotal = selectedTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const handleSliceClick = (entry: ChartDatum) => {
    // For "Lainnya" group, open with first sub-category or skip modal
    if (entry.originalNames.length === 1) {
      setSelectedCategory(entry.originalNames[0]);
    } else {
      // For grouped "Lainnya", we show all combined transactions
      setSelectedCategory("Lainnya");
    }
  };

  // Combine transactions for "Lainnya" group
  const getLainyaTransactions = (): CategoryTransaction[] => {
    const lainyaEntry = chartData.find((d) => d.name === "Lainnya");
    if (!lainyaEntry) return [];
    return lainyaEntry.originalNames
      .flatMap((name) => transactionsByCategory[name] ?? [])
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const getModalTransactions = (): CategoryTransaction[] => {
    if (selectedCategory === "Lainnya") return getLainyaTransactions();
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
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
                content={(props) => (
                  <CustomTooltip {...props} formatCurrency={formatCurrency} />
                )}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
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
                        {tx.description ?? "—"}
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

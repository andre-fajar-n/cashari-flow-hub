import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight } from "lucide-react";
import { CashFlowMonthItem } from "@/hooks/queries/use-cashflow-trend";

interface CashFlowBarChartProps {
  data: CashFlowMonthItem[];
  isLoading?: boolean;
  formatCurrency: (val: number) => string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: CustomTooltipProps & { formatCurrency: (val: number) => string }) => {
  if (!active || !payload || payload.length === 0) return null;

  const income = payload.find((p) => p.name === "Pemasukan");
  const expense = payload.find((p) => p.name === "Pengeluaran");
  const net = (income?.value ?? 0) - (expense?.value ?? 0);
  const isPositiveNet = net >= 0;

  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3.5 shadow-xl min-w-[200px]">
      <p className="font-semibold mb-2.5 text-sm border-b pb-2">{label}</p>
      <div className="space-y-1.5">
        {income && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Pemasukan</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-emerald-600">
              {formatCurrency(income.value)}
            </span>
          </div>
        )}
        {expense && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Pengeluaran</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-rose-600">
              {formatCurrency(expense.value)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-6 border-t pt-1.5 mt-1.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-sm shrink-0 ${isPositiveNet ? "bg-emerald-300" : "bg-rose-300"}`}
            />
            <span className="text-xs text-muted-foreground">Bersih</span>
          </div>
          <span
            className={`text-sm font-bold tabular-nums ${isPositiveNet ? "text-emerald-600" : "text-rose-600"}`}
          >
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CashFlowBarChart = ({
  data,
  isLoading,
  formatCurrency,
}: CashFlowBarChartProps) => {
  if (isLoading) {
    return (
      <Card className="border bg-card shadow-none">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ArrowLeftRight className="h-4 w-4 text-primary/70 shrink-0" />
          Tren Pemasukan vs Pengeluaran
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada data arus kas untuk periode ini
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tickFormatter={(val: number) => {
                  if (val >= 1_000_000_000)
                    return `${(val / 1_000_000_000).toFixed(1)}M`;
                  if (val >= 1_000_000)
                    return `${(val / 1_000_000).toFixed(0)}jt`;
                  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
                  return val.toString();
                }}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip {...props} formatCurrency={formatCurrency} />
                )}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="income"
                name="Pemasukan"
                fill="#10b981"
                stroke="#10b981"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Pengeluaran"
                fill="#f43f5e"
                stroke="#f43f5e"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowBarChart;

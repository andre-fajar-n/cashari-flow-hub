import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { type ValueType, type NameType } from "recharts/types/component/DefaultTooltipContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { CashFlowMonthItem } from "@/hooks/queries/use-cashflow-trend";
import {
  CashFlowPeriodTransaction,
  CashFlowPeriodData,
} from "@/hooks/queries/use-cashflow-transactions-by-period";

interface CashFlowBarChartProps {
  data: CashFlowMonthItem[];
  isLoading?: boolean;
  formatCurrency: (val: number) => string;
  transactionsByPeriod?: Record<string, CashFlowPeriodData>;
  baseCurrencyCode?: string;
}

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  formatCurrency: (val: number) => string;
};

const CustomTooltip = ({ active, payload, label, formatCurrency }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const incomeEntry = payload.find((p) => p.name === "Pemasukan");
  const expenseEntry = payload.find((p) => p.name === "Pengeluaran");
  const incomeVal = typeof incomeEntry?.value === "number" ? incomeEntry.value : 0;
  const expenseVal = typeof expenseEntry?.value === "number" ? expenseEntry.value : 0;
  const net = incomeVal - expenseVal;
  const isPositiveNet = net >= 0;

  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3.5 shadow-xl min-w-[200px]">
      <p className="font-semibold mb-2.5 text-sm border-b pb-2">{label}</p>
      <div className="space-y-1.5">
        {incomeEntry && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Pemasukan</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-emerald-600">
              {formatCurrency(incomeVal)}
            </span>
          </div>
        )}
        {expenseEntry && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Pengeluaran</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-rose-600">
              {formatCurrency(expenseVal)}
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

interface TransactionRowProps {
  tx: CashFlowPeriodTransaction;
  amountColorClass: string;
  formatCurrency: (val: number) => string;
  baseCurrencyCode?: string;
}

const TransactionRow = ({ tx, amountColorClass, formatCurrency, baseCurrencyCode }: TransactionRowProps) => {
  const hasOriginal =
    tx.currencyCode !== null &&
    (baseCurrencyCode
      ? tx.currencyCode !== baseCurrencyCode
      : Math.abs(tx.originalAmount - tx.amount) > 0.001);

  return (
    <div className="flex items-start justify-between py-2.5 border-b last:border-b-0 gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground tabular-nums">
          {format(parseISO(tx.date), "dd MMM yyyy", { locale: id })}
        </p>
        <p className="text-sm text-foreground truncate mt-0.5">
          {tx.description || tx.categoryName}
        </p>
        <span className="inline-block text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5 mt-0.5">
          {tx.categoryName}
        </span>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <p className={cn("text-sm font-semibold tabular-nums", amountColorClass)}>
          {formatCurrency(tx.amount)}
        </p>
        {hasOriginal && (
          <p className="text-xs tabular-nums text-muted-foreground mt-0.5">
            {tx.currencySymbol ?? tx.currencyCode}{" "}
            {formatCurrency(tx.originalAmount)}
          </p>
        )}
      </div>
    </div>
  );
};

const CashFlowBarChart = ({
  data,
  isLoading,
  formatCurrency,
  transactionsByPeriod,
  baseCurrencyCode,
}: CashFlowBarChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<{ key: string; label: string } | null>(null);

  const handleBarClick = (barData: CashFlowMonthItem) => {
    setSelectedPeriod({ key: barData.yearMonth, label: barData.month });
  };

  const periodData: CashFlowPeriodData = selectedPeriod
    ? (transactionsByPeriod?.[selectedPeriod.key] ?? { income: [], expense: [] })
    : { income: [], expense: [] };

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
    <>
      <Card className="border bg-card shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ArrowLeftRight className="h-4 w-4 text-primary/70 shrink-0" />
            Tren Pemasukan vs Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {transactionsByPeriod && (
            <p className="text-xs text-muted-foreground mb-3">
              Klik area data untuk melihat detail transaksi
            </p>
          )}
          {data.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Tidak ada data arus kas untuk periode ini
              </p>
            </div>
          ) : (
            <div style={{ cursor: transactionsByPeriod ? "pointer" : "default" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                barCategoryGap="30%"
                barGap={4}
                onClick={(chartData) => {
                  if (!transactionsByPeriod || !chartData?.activePayload?.[0]?.payload) return;
                  handleBarClick(chartData.activePayload[0].payload as CashFlowMonthItem);
                }}
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedPeriod}
        onOpenChange={(open) => {
          if (!open) setSelectedPeriod(null);
        }}
      >
        <DialogContent className="max-w-3xl flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Transaksi — {selectedPeriod?.label}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
            {/* Pemasukan section */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0 md:pr-4">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 shrink-0">
                Pemasukan ({periodData.income.length})
              </p>
              <div className="flex-1 overflow-y-auto">
                {periodData.income.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tidak ada transaksi
                  </p>
                ) : (
                  periodData.income.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      amountColorClass="text-emerald-600"
                      formatCurrency={formatCurrency}
                      baseCurrencyCode={baseCurrencyCode}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Vertical divider (desktop) */}
            <div className="hidden md:block w-px bg-border shrink-0" />
            {/* Horizontal divider (mobile) */}
            <div className="block md:hidden h-px bg-border shrink-0 my-3" />

            {/* Pengeluaran section */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0 md:pl-4">
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2 shrink-0">
                Pengeluaran ({periodData.expense.length})
              </p>
              <div className="flex-1 overflow-y-auto">
                {periodData.expense.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tidak ada transaksi
                  </p>
                ) : (
                  periodData.expense.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      amountColorClass="text-rose-600"
                      formatCurrency={formatCurrency}
                      baseCurrencyCode={baseCurrencyCode}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CashFlowBarChart;

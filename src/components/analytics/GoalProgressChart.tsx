import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO, addDays, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp } from "lucide-react";
import { GoalModel } from "@/models/goals";
import { GoalProgressDataPoint } from "@/hooks/queries/use-goal-progress-history";
import { formatAmountCurrency } from "@/lib/currency";

interface GoalProgressChartProps {
  goal: GoalModel;
  history: GoalProgressDataPoint[];
  isLoading: boolean;
  currencySymbol?: string;
}

interface ChartPoint {
  date: string;
  label: string;
  actual?: number;
  projection?: number;
  target: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currencyCode,
  currencySymbol,
}: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-card border rounded-xl shadow-lg p-3 min-w-[180px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </span>
          <span className="font-semibold tabular-nums">
            {p.value != null
              ? formatAmountCurrency(p.value, currencyCode, currencySymbol)
              : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const GoalProgressChart = ({
  goal,
  history,
  isLoading,
  currencySymbol = "",
}: GoalProgressChartProps) => {
  const [showProjection, setShowProjection] = useState(false);

  const { chartData, estimatedCompletionDate } = useMemo(() => {
    if (!history.length) return { chartData: [], estimatedCompletionDate: null };

    const targetAmount = goal.target_amount;
    const today = new Date();

    // Build actual data points
    const actualPoints: ChartPoint[] = history.map((pt) => ({
      date: pt.date,
      label: format(parseISO(pt.date), "d MMM yy", { locale: idLocale }),
      actual: pt.balance,
      target: targetAmount,
    }));

    let estimatedCompletionDate: Date | null = null;

    if (showProjection && history.length >= 2) {
      // Compute velocity from last 90 days
      const cutoff = addDays(today, -90);
      const recent = history.filter((pt) => parseISO(pt.date) >= cutoff);

      let velocity = 0;
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const days = differenceInDays(parseISO(last.date), parseISO(first.date));
        if (days > 0) {
          velocity = (last.balance - first.balance) / days;
        }
      }

      const currentBalance = history[history.length - 1].balance;
      const remaining = targetAmount - currentBalance;

      if (velocity > 0 && remaining > 0) {
        const daysToComplete = Math.ceil(remaining / velocity);
        estimatedCompletionDate = addDays(today, daysToComplete);

        // Add projection points (monthly for up to 2 years)
        const projPoints: ChartPoint[] = [];
        const projMonths = Math.min(Math.ceil(daysToComplete / 30) + 1, 24);
        for (let m = 1; m <= projMonths; m++) {
          const projDate = addDays(today, m * 30);
          const projBalance = Math.min(
            currentBalance + velocity * m * 30,
            targetAmount
          );
          projPoints.push({
            date: format(projDate, "yyyy-MM-dd"),
            label: format(projDate, "d MMM yy", { locale: idLocale }),
            projection: projBalance,
            target: targetAmount,
          });
        }
        return {
          chartData: [...actualPoints, ...projPoints],
          estimatedCompletionDate,
        };
      }
    }

    return { chartData: actualPoints, estimatedCompletionDate };
  }, [history, goal.target_amount, showProjection]);

  const currentBalance = history.length ? history[history.length - 1].balance : 0;
  const progressPct =
    goal.target_amount > 0
      ? Math.min((currentBalance / goal.target_amount) * 100, 100)
      : 0;
  const isAchieved = currentBalance >= goal.target_amount && goal.target_amount > 0;

  const yAxisFormatter = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
    return String(v);
  };

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-base">{goal.name}</CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className={
                isAchieved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : progressPct >= 75
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-muted/50 text-muted-foreground"
              }
            >
              {Math.round(progressPct)}% tercapai
            </Badge>
            {!isAchieved && (
              <div className="flex items-center gap-1.5">
                <Switch
                  id={`proj-${goal.id}`}
                  checked={showProjection}
                  onCheckedChange={setShowProjection}
                  className="scale-90"
                />
                <Label
                  htmlFor={`proj-${goal.id}`}
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Proyeksi
                </Label>
              </div>
            )}
          </div>
        </div>

        {showProjection && estimatedCompletionDate && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Est. selesai:{" "}
            <span className="font-semibold text-primary">
              {format(estimatedCompletionDate, "MMMM yyyy", { locale: idLocale })}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            Belum ada data riwayat untuk tujuan ini.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`actual-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`proj-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={yAxisFormatter}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    currencyCode={goal.currency_code}
                    currencySymbol={currencySymbol}
                  />
                }
              />
              <ReferenceLine
                y={goal.target_amount}
                stroke="#10b981"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: "Target",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#10b981",
                }}
              />
              {goal.target_date && (
                <ReferenceLine
                  x={format(parseISO(goal.target_date), "d MMM yy", { locale: idLocale })}
                  stroke="#6366f1"
                  strokeDasharray="4 2"
                  strokeWidth={1.5}
                  label={{
                    value: "Tgl Target",
                    position: "insideTopLeft",
                    fontSize: 10,
                    fill: "#6366f1",
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="actual"
                name="Tabungan Aktual"
                stroke="#f59e0b"
                strokeWidth={2}
                fill={`url(#actual-${goal.id})`}
                dot={false}
                connectNulls={false}
              />
              {showProjection && (
                <Area
                  type="monotone"
                  dataKey="projection"
                  name="Proyeksi"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  fill={`url(#proj-${goal.id})`}
                  dot={false}
                  connectNulls={false}
                />
              )}
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalProgressChart;

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  GoalAllocationItem,
  InstrumentDistributionItem,
  AssetDistributionItem,
  WalletDistributionItem,
} from "@/hooks/queries/use-portfolio-distribution";

interface PortfolioDistributionChartProps {
  goalAllocation: GoalAllocationItem[];
  instrumentDistribution: InstrumentDistributionItem[];
  assetDistribution: AssetDistributionItem[];
  walletDistribution: WalletDistributionItem[];
  isLoading?: boolean;
  formatCurrency: (val: number) => string;
}

const CHART_COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#6b7280", // gray-500
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string; value: number; percentage: number } }>;
  formatCurrency: (val: number) => string;
}

const CustomTooltip = ({ active, payload, formatCurrency }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="font-semibold text-sm mb-1">{item.name}</p>
      <p className="text-sm font-bold tabular-nums text-foreground">
        {formatCurrency(item.value)}
      </p>
      <p className="text-xs text-muted-foreground tabular-nums">
        {item.percentage.toFixed(1)}%
      </p>
    </div>
  );
};

interface DonutChartViewProps {
  data: Array<{ name: string; value: number; percentage: number }>;
  totalValue: number;
  formatCurrency: (val: number) => string;
  emptyLabel: string;
  legendValueLabel: string;
}

const DonutChartView = ({
  data,
  totalValue,
  formatCurrency,
  emptyLabel,
  legendValueLabel,
}: DonutChartViewProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      {/* Donut chart with center label */}
      <div className="relative shrink-0 w-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
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
                <CustomTooltip
                  active={props.active}
                  payload={props.payload as CustomTooltipProps["payload"]}
                  formatCurrency={formatCurrency}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Total
          </p>
          <p className="text-xs font-bold tabular-nums text-foreground leading-tight mt-0.5 px-2 text-center">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      {/* Legend — scrollable, right of chart */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="overflow-y-auto max-h-[185px] space-y-1 pr-1">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 py-0.5"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-xs text-foreground truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold tabular-nums text-foreground whitespace-nowrap text-right">
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t mt-1 shrink-0">
          <span className="text-xs font-semibold text-foreground truncate">{legendValueLabel}</span>
          <span className="text-xs font-bold tabular-nums text-foreground whitespace-nowrap">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

const PortfolioDistributionChart = ({
  goalAllocation,
  instrumentDistribution,
  assetDistribution,
  walletDistribution,
  isLoading,
  formatCurrency,
}: PortfolioDistributionChartProps) => {
  const [activeTab, setActiveTab] = useState("wallet");

  if (isLoading) {
    return (
      <Card className="border bg-card shadow-none">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[340px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const goalData = goalAllocation.map((g) => ({
    name: g.goalName,
    value: g.currentValue,
    percentage: g.percentage,
  }));

  const instrumentData = instrumentDistribution.map((i) => ({
    name: i.instrumentName,
    value: i.currentValue,
    percentage: i.percentage,
  }));

  const assetData = assetDistribution.map((a) => ({
    name: a.assetName,
    value: a.currentValue,
    percentage: a.percentage,
  }));

  const walletData = walletDistribution.map((w) => ({
    name: w.walletName,
    value: w.currentValue,
    percentage: w.percentage,
  }));

  const totalGoalValue = goalAllocation.reduce(
    (sum, g) => sum + g.currentValue,
    0
  );
  const totalInstrumentValue = instrumentDistribution.reduce(
    (sum, i) => sum + i.currentValue,
    0
  );
  const totalAssetValue = assetDistribution.reduce(
    (sum, a) => sum + a.currentValue,
    0
  );

  const totalWalletValue = walletDistribution.reduce(
    (sum, w) => sum + w.currentValue,
    0
  );

  const isEmpty =
    goalAllocation.length === 0 &&
    instrumentDistribution.length === 0 &&
    assetDistribution.length === 0 &&
    walletDistribution.length === 0;

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <PieChartIcon className="h-4 w-4 text-primary/70 shrink-0" />
          Distribusi Portofolio
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isEmpty ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada data investasi</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 h-8">
              <TabsTrigger value="wallet" className="text-xs h-7 px-3">
                Dompet
              </TabsTrigger>
              <TabsTrigger value="goal" className="text-xs h-7 px-3">
                Tujuan
              </TabsTrigger>
              <TabsTrigger value="instrument" className="text-xs h-7 px-3">
                Instrumen
              </TabsTrigger>
              <TabsTrigger value="asset" className="text-xs h-7 px-3">
                Aset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goal">
              <DonutChartView
                data={goalData}
                totalValue={totalGoalValue}
                formatCurrency={formatCurrency}
                emptyLabel="Belum ada data alokasi tujuan"
                legendValueLabel="Total Nilai Saat Ini"
              />
            </TabsContent>

            <TabsContent value="instrument">
              <DonutChartView
                data={instrumentData}
                totalValue={totalInstrumentValue}
                formatCurrency={formatCurrency}
                emptyLabel="Belum ada data distribusi instrumen"
                legendValueLabel="Total Nilai Saat Ini"
              />
            </TabsContent>

            <TabsContent value="asset">
              <DonutChartView
                data={assetData}
                totalValue={totalAssetValue}
                formatCurrency={formatCurrency}
                emptyLabel="Belum ada data distribusi aset"
                legendValueLabel="Total Nilai Saat Ini"
              />
            </TabsContent>

            <TabsContent value="wallet">
              <DonutChartView
                data={walletData}
                totalValue={totalWalletValue}
                formatCurrency={formatCurrency}
                emptyLabel="Belum ada data distribusi dompet"
                legendValueLabel="Total Nilai Saat Ini"
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioDistributionChart;

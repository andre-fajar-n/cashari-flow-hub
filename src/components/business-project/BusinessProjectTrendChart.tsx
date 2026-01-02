import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmountCurrency } from "@/lib/currency";
import { TrendingUp } from "lucide-react";

interface Transaction {
  id: number;
  transaction_id: number;
  transactions: {
    id: number;
    amount: number;
    date: string;
    categories: {
      name: string;
      is_income: boolean | null;
    } | null;
    wallets: {
      name: string;
      currency_code: string;
    } | null;
  };
}

interface BusinessProjectTrendChartProps {
  transactions: Transaction[];
  baseCurrencyCode?: string | null;
  baseCurrencySymbol?: string | null;
}

interface MonthlyData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

const BusinessProjectTrendChart = ({
  transactions,
  baseCurrencyCode = "IDR",
  baseCurrencySymbol = "Rp",
}: BusinessProjectTrendChartProps) => {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Group transactions by month
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((item) => {
      const trx = item.transactions;
      if (!trx) return;

      const date = parseISO(trx.date);
      const monthKey = format(date, "yyyy-MM");
      
      const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };
      
      if (trx.categories?.is_income) {
        current.income += Math.abs(trx.amount);
      } else {
        current.expense += Math.abs(trx.amount);
      }
      
      monthlyMap.set(monthKey, current);
    });

    // Sort by month and convert to array
    const sortedMonths = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    return sortedMonths.map(([month, data]): MonthlyData => {
      const date = parseISO(`${month}-01`);
      return {
        month,
        monthLabel: format(date, "MMM yyyy", { locale: idLocale }),
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    });
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tren Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data untuk ditampilkan
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return formatAmountCurrency(value, baseCurrencyCode || "IDR", baseCurrencySymbol || "Rp");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Tren Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(0)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  const income = payload.find(p => p.dataKey === "income")?.value as number || 0;
                  const expense = payload.find(p => p.dataKey === "expense")?.value as number || 0;
                  const net = income - expense;
                  
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <p className="font-semibold mb-2">{label}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-green-600">Pemasukan:</span>
                          <span className="font-medium">{formatCurrency(income)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-red-600">Pengeluaran:</span>
                          <span className="font-medium">{formatCurrency(expense)}</span>
                        </div>
                        <div className="border-t pt-1 mt-1 flex items-center justify-between gap-4">
                          <span className={net >= 0 ? "text-green-600" : "text-red-600"}>Net:</span>
                          <span className={`font-semibold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {net >= 0 ? "+" : ""}{formatCurrency(net)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === "income") return "Pemasukan";
                  if (value === "expense") return "Pengeluaran";
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#colorIncome)"
                name="income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#colorExpense)"
                name="expense"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProjectTrendChart;

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
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
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
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
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span>Pemasukan:</span>
                          </div>
                          <span className="font-medium text-emerald-600">{formatCurrency(income)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span>Pengeluaran:</span>
                          </div>
                          <span className="font-medium text-rose-600">{formatCurrency(expense)}</span>
                        </div>
                        <div className="border-t pt-1 mt-1 flex items-center justify-between gap-4">
                          <span className={net >= 0 ? "text-emerald-600" : "text-rose-600"}>Net:</span>
                          <span className={`font-semibold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
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
                  if (value === "income") return <span className="text-emerald-600 font-medium">Pemasukan</span>;
                  if (value === "expense") return <span className="text-rose-600 font-medium">Pengeluaran</span>;
                  return value;
                }}
              />
              <Line 
                type="monotone"
                dataKey="income" 
                name="income"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line 
                type="monotone"
                dataKey="expense" 
                name="expense"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ fill: "#f43f5e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProjectTrendChart;

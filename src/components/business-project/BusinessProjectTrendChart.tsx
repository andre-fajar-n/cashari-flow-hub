import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import { ReusableLineChart, ChartLineConfig } from "@/components/ui/charts";
import { formatAmountCurrency } from "@/lib/currency";

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
  label: string;
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

    const sortedMonths = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    return sortedMonths.map(([month, data]): MonthlyData => {
      const date = parseISO(`${month}-01`);
      return {
        month,
        label: format(date, "MMM yyyy", { locale: idLocale }),
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    });
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return formatAmountCurrency(value, baseCurrencyCode || "IDR", baseCurrencySymbol || "Rp");
  };

  const lines: ChartLineConfig[] = [
    {
      dataKey: "income",
      name: "income",
      stroke: "#10b981",
    },
    {
      dataKey: "expense",
      name: "expense",
      stroke: "#f43f5e",
    },
    {
      dataKey: "net",
      name: "net",
      stroke: "#3b82f6",
      strokeDasharray: "5 5",
    },
  ];

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) => {
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
  };

  const legendFormatter = (value: string) => {
    if (value === "income") return <span className="text-emerald-600 font-medium">Pemasukan</span>;
    if (value === "expense") return <span className="text-rose-600 font-medium">Pengeluaran</span>;
    if (value === "net") return <span className="text-blue-600 font-medium">Net Profit/Loss</span>;
    return value;
  };

  return (
    <ReusableLineChart
      data={chartData}
      lines={lines}
      title="Tren Bulanan"
      titleIcon={<TrendingUp className="w-5 h-5" />}
      height={300}
      showLegend
      emptyMessage="Belum ada data untuk ditampilkan"
      customTooltip={customTooltip}
      legendFormatter={legendFormatter}
    />
  );
};

export default BusinessProjectTrendChart;

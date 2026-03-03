import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import PeriodFilter, { PeriodType } from "@/components/analytics/PeriodFilter";
import BalanceTrendChart from "@/components/analytics/BalanceTrendChart";
import TrendSummaryCards from "@/components/analytics/TrendSummaryCards";
import { useBalanceTrend, Granularity } from "@/hooks/queries/use-balance-trend";

const BalanceTrend = () => {
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const handlePeriodChange = (type: PeriodType, start: Date, end: Date) => {
    setPeriodType(type);
    setStartDate(start);
    setEndDate(end);
  };

  const granularity: Granularity = periodType === "yearly" ? "month" :
    (periodType === "custom" && (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) > 60) ? "month" : "day";

  const { data, isLoading } = useBalanceTrend(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd"),
    granularity
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tren Saldo</h1>
            <p className="text-muted-foreground">
              Analisis pertumbuhan total saldo portofolio Anda.
            </p>
          </div>

          <PeriodFilter
            onPeriodChange={handlePeriodChange}
            initialType={periodType}
            initialStart={startDate}
            initialEnd={endDate}
          />

          <TrendSummaryCards data={data || []} isLoading={isLoading} />

          <BalanceTrendChart
            data={data || []}
            granularity={granularity}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default BalanceTrend;

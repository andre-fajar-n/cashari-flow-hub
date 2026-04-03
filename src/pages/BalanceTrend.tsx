import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import PeriodFilter, { PeriodType } from "@/components/analytics/PeriodFilter";
import BalanceTrendChart from "@/components/analytics/BalanceTrendChart";
import TrendSummaryCards from "@/components/analytics/TrendSummaryCards";
import { useBalanceTrend, Granularity } from "@/hooks/queries/use-balance-trend";
import { useGoldPriceTrend } from "@/hooks/queries/use-gold-price-trend";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { TrendingUp } from "lucide-react";

const BalanceTrend = () => {
  const [periodType, setPeriodType] = useState<PeriodType>("daily");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const handlePeriodChange = (type: PeriodType, start: Date, end: Date) => {
    setPeriodType(type);
    setStartDate(start);
    setEndDate(end);
  };

  const granularity: Granularity = periodType === "yearly" ? "year" :
    periodType === "monthly" ? "month" : "day";

  const { data: userSettings } = useUserSettings();
  const baseCurrency = userSettings?.base_currency_code || 'IDR';

  const { data, isLoading } = useBalanceTrend(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd"),
    granularity
  );

  const { data: goldTrendData, isLoading: isLoadingGoldPrice } = useGoldPriceTrend(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd"),
    granularity,
    baseCurrency
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 px-6 py-5">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_top_left,white,transparent_70%)]" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-sm">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Tren Saldo</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Analisis pertumbuhan total saldo portofolio Anda dari waktu ke waktu.
                </p>
              </div>
            </div>
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
            goldTrendData={goldTrendData || []}
            granularity={granularity}
            isLoadingGoldPrice={isLoadingGoldPrice}
            isLoading={isLoading}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default BalanceTrend;

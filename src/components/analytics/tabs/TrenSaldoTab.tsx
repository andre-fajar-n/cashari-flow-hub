import { format } from "date-fns";
import { Granularity, useBalanceTrend } from "@/hooks/queries/use-balance-trend";
import { useGoldPriceTrend } from "@/hooks/queries/use-gold-price-trend";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import PeriodFilter, { PeriodType } from "@/components/analytics/PeriodFilter";
import TrendSummaryCards from "@/components/analytics/TrendSummaryCards";
import BalanceTrendChart from "@/components/analytics/BalanceTrendChart";
import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

const TrenSaldoTab = () => {
  const [periodType, setPeriodType] = useState<PeriodType>("daily");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const handlePeriodChange = (type: PeriodType, start: Date, end: Date) => {
    setPeriodType(type);
    setStartDate(start);
    setEndDate(end);
  };

  const granularity: Granularity =
    periodType === "yearly" ? "year" : periodType === "monthly" ? "month" : "day";

  const { data: userSettings } = useUserSettings();
  const baseCurrency = userSettings?.base_currency_code || "IDR";

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
    <div className="space-y-4">
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
  );
};

export default TrenSaldoTab;

import { formatAmountCurrency } from "@/lib/currency";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { usePortfolioDistribution } from "@/hooks/queries/use-portfolio-distribution";
import PortfolioDistributionChart from "@/components/analytics/PortfolioDistributionChart";
import PortfolioPerformanceChart from "@/components/analytics/PortfolioPerformanceChart";

const PortofolioTab = () => {
  const { data: userSettings } = useUserSettings();
  const baseCurrency = userSettings?.base_currency_code;
  const baseCurrencySymbol = userSettings?.currencies?.symbol;

  const formatCurrency = (val: number) =>
    formatAmountCurrency(val, baseCurrency, baseCurrencySymbol);

  const { data: distribution, isLoading: isLoadingDist } =
    usePortfolioDistribution();

  return (
    <div className="space-y-6">
      <PortfolioDistributionChart
        goalAllocation={distribution?.goalAllocation ?? []}
        instrumentDistribution={distribution?.instrumentDistribution ?? []}
        assetDistribution={distribution?.assetDistribution ?? []}
        walletDistribution={distribution?.walletDistribution ?? []}
        isLoading={isLoadingDist}
        formatCurrency={formatCurrency}
      />

      <PortfolioPerformanceChart
        formatCurrency={formatCurrency}
        baseCurrency={baseCurrency}
      />
    </div>
  );
};

export default PortofolioTab;

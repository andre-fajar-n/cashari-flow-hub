import { useAssetDetailSummary } from "@/hooks/queries/use-asset-detail-summary";
import AssetSummaryHeader from "@/components/investment/AssetSummaryHeader";
import AssetProfitBreakdown from "@/components/investment/AssetProfitBreakdown";
import AssetBreakdownSection from "@/components/investment/AssetBreakdownSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AssetOverviewProps {
  assetId: number;
}

const AssetOverview = ({ assetId }: AssetOverviewProps) => {
  const { data: summary, isLoading } = useAssetDetailSummary(assetId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header Section - Main KPIs */}
      <AssetSummaryHeader
        summary={summary}
      />

      {/* Profit Breakdown Section */}
      <AssetProfitBreakdown summary={summary} />

      {/* Goal/Wallet Allocation Section */}
      <AssetBreakdownSection
        items={summary.items}
        baseCurrencyCode={summary.baseCurrencyCode || summary.originalCurrencyCode}
      />
    </div>
  );
};

export default AssetOverview;

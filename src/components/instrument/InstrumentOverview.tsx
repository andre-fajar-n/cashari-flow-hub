import { useInstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";
import InstrumentSummaryHeader from "@/components/instrument/InstrumentSummaryHeader";
import InstrumentBreakdownSection from "@/components/instrument/InstrumentBreakdownSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfitBreakdown } from "@/components/investment/ProfitBreakdown";

interface InstrumentOverviewProps {
  instrumentId: number;
}

const InstrumentOverview = ({ instrumentId }: InstrumentOverviewProps) => {
  const { data: summary, isLoading } = useInstrumentDetailSummary(instrumentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3].map((i) => (
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
      <InstrumentSummaryHeader
        summary={summary}
      />

      {/* Profit Breakdown Section */}
      <ProfitBreakdown summary={summary} />

      {/* Asset List / Hierarchy Breakdown Section */}
      <InstrumentBreakdownSection
        items={summary.items}
        baseCurrencyCode={summary.baseCurrencyCode || summary.originalCurrencyCode}
      />
    </div>
  );
};

export default InstrumentOverview;
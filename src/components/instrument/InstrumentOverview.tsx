import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { useInstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";
import InstrumentSummaryHeader from "@/components/instrument/InstrumentSummaryHeader";
import InstrumentBreakdownSection from "@/components/instrument/InstrumentBreakdownSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface InstrumentOverviewProps {
  instrument: InvestmentInstrumentModel;
}

const InstrumentOverview = ({ instrument }: InstrumentOverviewProps) => {
  const { data: summary, isLoading } = useInstrumentDetailSummary(instrument.id);

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
      <InstrumentSummaryHeader 
        instrument={instrument} 
        summary={summary} 
      />
      <InstrumentBreakdownSection 
        items={summary.items} 
        baseCurrencyCode={summary.baseCurrencyCode || summary.originalCurrencyCode}
        originalCurrencyCode={summary.originalCurrencyCode}
      />
    </div>
  );
};

export default InstrumentOverview;

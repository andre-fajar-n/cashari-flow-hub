import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PiggyBank } from "lucide-react";
import { InstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";
import { MetricCard } from "@/components/investment/MetricCard";
import { RoiCard } from "@/components/investment/RoiCard";

interface InstrumentSummaryHeaderProps {
  summary: InstrumentDetailSummary;
}

const InstrumentSummaryHeader = ({
  summary,
}: InstrumentSummaryHeaderProps) => {
  const isSameCurrency = summary.originalCurrencyCode === summary.baseCurrencyCode;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ringkasan Instrumen
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {summary.isMultiCurrency ? (
              <Badge variant="secondary">Multi Currency</Badge>
            ) : (
              <Badge variant="outline">{summary.originalCurrencyCode}</Badge>
            )}
            {summary.isTrackable ? (
              <Badge variant="secondary">Trackable</Badge>
            ) : (
              <Badge variant="outline">Non-trackable</Badge>
            )}
          </div>
        </div>
        {summary.isMultiCurrency ? (
          <p className="text-sm text-muted-foreground mt-1">
            Metrik utama dalam {summary.baseCurrencyCode}, karena instrumen ini memiliki lebih dari 1 mata uang
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            Metrik utama dalam {summary.originalCurrencyCode}{!isSameCurrency && `, konversi ke ${summary.baseCurrencyCode} sebagai referensi`}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <MetricCard
            icon={BarChart3}
            label="Nilai Saat Ini"
            tooltip="Nilai total instrumen berdasarkan harga pasar terakhir."
            originalValue={summary.currentValue}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.currentValueBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBaseOnly={summary.isMultiCurrency || isSameCurrency}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard
            icon={PiggyBank}
            label="Modal Diinvestasikan"
            tooltip="Dana yang diinvestasikan pada instrumen ini, termasuk modal yang sudah ditarik."
            originalValue={summary.investedCapital}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.investedCapitalBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBaseOnly={summary.isMultiCurrency || isSameCurrency}
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Profit"
            tooltip="Total keuntungan dari instrumen ini (terealisasi + belum terealisasi)."
            showSign={true}
            originalValue={summary.totalProfit}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.totalProfitBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBaseOnly={summary.isMultiCurrency || isSameCurrency}
          />
          <RoiCard
            roi={summary.roi}
            label="ROI"
            tooltip="Return on Investment berdasarkan total keuntungan dibandingkan dengan seluruh modal yang pernah diinvestasikan. Dihitung dalam base currency."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard
            icon={PiggyBank}
            label="Modal Aktif"
            tooltip="Dana yang saat ini masih aktif di instrumen ini dan belum ditarik."
            originalValue={summary.activeCapital}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.activeCapitalBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBaseOnly={summary.isMultiCurrency || isSameCurrency}
          />
          <MetricCard
            icon={TrendingUp}
            label="Keuntungan Belum Terealisasi"
            tooltip="Total keuntungan dari instrumen ini (belum terealisasi)."
            showSign={true}
            originalValue={summary.unrealizedProfit}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.unrealizedAssetProfit + summary.unrealizedCurrencyProfit}
            baseCurrency={summary.baseCurrencyCode}
            showBaseOnly={summary.isMultiCurrency || isSameCurrency}
          />
          <RoiCard
            roi={summary.unrealizedProfitPercentage}
            label="Estimasi Keuntungan (%)"
            tooltip="Keuntungan belum terealisasi dibandingkan dengan modal aktif saat ini. Dihitung dalam currency instrumen."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InstrumentSummaryHeader;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PiggyBank } from "lucide-react";
import { MetricCard } from "@/components/investment/MetricCard";
import { RoiCard } from "@/components/investment/RoiCard";
import { DetailSummary } from "@/models/investment";

interface AssetSummaryHeaderProps {
  summary: DetailSummary;
}

const AssetSummaryHeader = ({
  summary,
}: AssetSummaryHeaderProps) => {
  const isSameCurrency = summary.originalCurrencyCode === summary.baseCurrencyCode;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ringkasan Aset
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{summary.originalCurrencyCode}</Badge>
            {summary.isTrackable ? (
              <Badge variant="secondary">Trackable</Badge>
            ) : (
              <Badge variant="outline">Non-trackable</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Metrik utama dalam {summary.originalCurrencyCode}
          {!isSameCurrency && `, konversi ke ${summary.baseCurrencyCode} sebagai referensi`}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <MetricCard
            icon={BarChart3}
            label="Nilai Saat Ini"
            tooltip="Nilai total aset berdasarkan harga pasar terakhir."
            originalValue={summary.currentValue}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.currentValueBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard
            icon={PiggyBank}
            label="Modal Diinvestasikan"
            tooltip="Dana yang diinvestasikan pada aset ini, termasuk modal yang sudah ditarik."
            originalValue={summary.investedCapital}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.investedCapitalBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Keuntungan"
            tooltip="Total keuntungan dari aset ini (terealisasi + belum terealisasi)."
            originalValue={summary.totalProfit}
            originalCurrency={summary.originalCurrencyCode}
            showSign={true}
            baseValue={summary.totalProfitBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
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
            tooltip="Dana yang saat ini masih aktif di aset ini dan belum ditarik."
            originalValue={summary.activeCapital}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.activeCapitalBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
          />
          <MetricCard
            icon={TrendingUp}
            label="Keuntungan Belum Terealisasi"
            tooltip="Total keuntungan dari aset ini (belum terealisasi)."
            originalValue={summary.unrealizedProfit}
            originalCurrency={summary.originalCurrencyCode}
            showSign={true}
            baseValue={summary.unrealizedAssetProfit + summary.unrealizedCurrencyProfit}
            baseCurrency={summary.baseCurrencyCode}
          />
          <RoiCard
            roi={summary.unrealizedProfitPercentage}
            label="Estimasi Keuntungan (%)"
            tooltip="Keuntungan belum terealisasi dibandingkan dengan modal aktif saat ini. Dihitung dalam currency aset."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetSummaryHeader;

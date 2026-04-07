import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PiggyBank } from "lucide-react";
import { InstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";
import { MetricCard } from "@/components/investment/MetricCard";
import { RoiCard } from "@/components/investment/RoiCard";
import { AmountText } from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";

interface InstrumentSummaryHeaderProps {
  summary: InstrumentDetailSummary;
}

const InstrumentSummaryHeader = ({
  summary,
}: InstrumentSummaryHeaderProps) => {
  const isSameCurrency = summary.originalCurrencyCode === summary.baseCurrencyCode;
  const showBaseOnly = summary.isMultiCurrency || isSameCurrency;
  const displayCurrency = showBaseOnly ? summary.baseCurrencyCode : summary.originalCurrencyCode;
  const displayCurrentValue = showBaseOnly ? summary.currentValueBaseCurrency : summary.currentValue;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            Ringkasan Instrumen
          </CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            {summary.isMultiCurrency ? (
              <Badge variant="secondary" className="text-xs">Multi Currency</Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-mono">{summary.originalCurrencyCode}</Badge>
            )}
            {summary.isTrackable ? (
              <Badge variant="secondary" className="text-xs">Trackable</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Non-trackable</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {summary.isMultiCurrency
            ? `Metrik utama dalam ${summary.baseCurrencyCode} (multi-currency)`
            : `Metrik dalam ${summary.originalCurrencyCode}${!isSameCurrency ? ` · referensi ${summary.baseCurrencyCode}` : ''}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary hero metric: Nilai Saat Ini */}
        <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Nilai Saat Ini</p>
              <p className="text-xs text-muted-foreground">Berdasarkan harga pasar terakhir</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary tabular-nums">
              {formatAmountCurrency(displayCurrentValue, displayCurrency, displayCurrency)}
            </p>
            {!showBaseOnly && (
              <p className="text-xs text-muted-foreground">
                ≈ {formatAmountCurrency(summary.currentValueBaseCurrency, summary.baseCurrencyCode, summary.baseCurrencyCode)}
              </p>
            )}
          </div>
        </div>

        {/* Row 1: Modal Diinvestasikan, Total Profit, ROI */}
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-0.5">Performa Total</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <MetricCard
              icon={PiggyBank}
              label="Modal Diinvestasikan"
              tooltip="Dana yang diinvestasikan pada instrumen ini, termasuk modal yang sudah ditarik."
              originalValue={summary.investedCapital}
              originalCurrency={summary.originalCurrencyCode}
              baseValue={summary.investedCapitalBaseCurrency}
              baseCurrency={summary.baseCurrencyCode}
              showBaseOnly={showBaseOnly}
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
              showBaseOnly={showBaseOnly}
            />
            <RoiCard
              roi={summary.roi}
              label="ROI"
              tooltip="Return on Investment berdasarkan total keuntungan dibandingkan dengan seluruh modal yang pernah diinvestasikan. Dihitung dalam base currency."
            />
          </div>
        </div>

        {/* Row 2: Modal Aktif, Keuntungan Belum Terealisasi, Estimasi % */}
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-0.5">Posisi Aktif</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <MetricCard
              icon={PiggyBank}
              label="Modal Aktif"
              tooltip="Dana yang saat ini masih aktif di instrumen ini dan belum ditarik."
              originalValue={summary.activeCapital}
              originalCurrency={summary.originalCurrencyCode}
              baseValue={summary.activeCapitalBaseCurrency}
              baseCurrency={summary.baseCurrencyCode}
              showBaseOnly={showBaseOnly}
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
              showBaseOnly={showBaseOnly}
            />
            <RoiCard
              roi={summary.unrealizedProfitPercentage}
              label="Estimasi Keuntungan (%)"
              tooltip="Keuntungan belum terealisasi dibandingkan dengan modal aktif saat ini. Dihitung dalam currency instrumen."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstrumentSummaryHeader;
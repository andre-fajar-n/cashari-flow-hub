import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, BarChart3, Percent, HelpCircle, PiggyBank } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { AssetDetailSummary } from "@/hooks/queries/use-asset-detail-summary";
import { formatPercentage } from "@/lib/number";

interface AssetSummaryHeaderProps {
  summary: AssetDetailSummary;
}

const MetricCard = ({
  icon: Icon,
  label,
  tooltip,
  originalValue,
  originalCurrency,
  baseValue,
  baseCurrency,
  showSign = false,
  showBase = true,
}: {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue?: number;
  baseCurrency?: string;
  showSign?: boolean;
  showBase?: boolean;
}) => {
  const isSameCurrency = originalCurrency === baseCurrency;

  return (
    <div className="p-4 rounded-lg border bg-card flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                {label}
                <HelpCircle className="w-3 h-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div>
        {showSign ? (
          <AmountText amount={originalValue} showSign={true} className="text-xl font-bold">
            {formatAmountCurrency(Math.abs(originalValue), originalCurrency, originalCurrency)}
          </AmountText>
        ) : (
          <p className="text-xl font-bold">
            {formatAmountCurrency(originalValue, originalCurrency, originalCurrency)}
          </p>
        )}
        {showBase && !isSameCurrency && baseValue !== undefined && baseCurrency && (
          <p className="text-xs text-muted-foreground italic mt-0.5">
            ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};

const RoiCard = ({
  roi,
  label,
  tooltip,
}: {
  roi: number | null;
  label: string;
  tooltip: string;
}) => (
  <div className="p-4 rounded-lg border bg-card flex flex-col items-center text-center">
    <div className="flex items-center gap-2 mb-2">
      <Percent className="w-4 h-4 text-muted-foreground" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
              {label}
              <HelpCircle className="w-3 h-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {roi !== null ? (
      <AmountText amount={roi} showSign={true} className="text-xl font-bold">
        {formatPercentage(Math.abs(roi))}%
      </AmountText>
    ) : (
      <p className="text-xl font-bold text-muted-foreground">—</p>
    )}
  </div>
);

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
            showBase={true}
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
            showBase={true}
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
            showBase={true}
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
            showBase={true}
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
            showBase={true}
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

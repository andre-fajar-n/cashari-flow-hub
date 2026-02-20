import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, Wallet, BarChart3, Percent, HelpCircle, PiggyBank } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { InstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { formatPercentage } from "@/lib/number";

interface InstrumentSummaryHeaderProps {
  instrument: InvestmentInstrumentModel;
  summary: InstrumentDetailSummary;
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
    <div className="p-4 rounded-lg border bg-card">
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
  tooltip,
}: {
  roi: number | null;
  tooltip: string;
}) => (
  <div className="p-4 rounded-lg border bg-card">
    <div className="flex items-center gap-2 mb-2">
      <Percent className="w-4 h-4 text-muted-foreground" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
              ROI
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

const InstrumentSummaryHeader = ({
  instrument,
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
        <p className="text-sm text-muted-foreground mt-1">
          Metrik utama dalam {summary.isMultiCurrency ? "original currency masing-masing aset" : summary.originalCurrencyCode}
          {!isSameCurrency && `, konversi ke ${summary.baseCurrencyCode} sebagai referensi`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={PiggyBank}
            label="Modal Aktif"
            tooltip="Dana yang saat ini masih aktif di instrumen ini dan belum ditarik."
            originalValue={summary.activeCapital}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.activeCapitalBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBase={!summary.isMultiCurrency}
          />
          <MetricCard
            icon={BarChart3}
            label="Nilai Saat Ini"
            tooltip="Nilai total instrumen berdasarkan harga pasar terakhir."
            originalValue={summary.currentValue}
            originalCurrency={summary.originalCurrencyCode}
            baseValue={summary.currentValueBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBase={!summary.isMultiCurrency}
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Profit"
            tooltip="Total keuntungan dari instrumen ini (terealisasi + belum terealisasi)."
            originalValue={summary.totalProfit}
            originalCurrency={summary.originalCurrencyCode}
            showSign={true}
            baseValue={summary.totalProfitBaseCurrency}
            baseCurrency={summary.baseCurrencyCode}
            showBase={!summary.isMultiCurrency}
          />
          <RoiCard
            roi={summary.roi}
            tooltip="ROI dihitung dari total keuntungan dibandingkan dengan seluruh dana yang pernah diinvestasikan (Total Profit / Invested Capital × 100)."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InstrumentSummaryHeader;
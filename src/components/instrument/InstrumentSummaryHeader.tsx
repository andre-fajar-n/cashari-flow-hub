import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, Wallet, BarChart3, Percent, HelpCircle } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { InstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";

interface InstrumentSummaryHeaderProps {
  instrument: InvestmentInstrumentModel;
  summary: InstrumentDetailSummary;
}

const MetricCard = ({
  icon: Icon,
  label,
  tooltip,
  value,
  currency,
  showSign = false,
  secondaryValue,
  secondaryCurrency,
  showSecondary = false,
}: {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  value: number;
  currency: string;
  showSign?: boolean;
  secondaryValue?: number;
  secondaryCurrency?: string;
  showSecondary?: boolean;
}) => (
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
        <AmountText amount={value} showSign={true} className="text-xl font-bold">
          {formatAmountCurrency(Math.abs(value), currency, currency)}
        </AmountText>
      ) : (
        <p className="text-xl font-bold">
          {formatAmountCurrency(value, currency, currency)}
        </p>
      )}
      {showSecondary && secondaryValue !== undefined && secondaryCurrency && (
        <p className="text-xs text-muted-foreground italic mt-0.5">
          ≈ {formatAmountCurrency(secondaryValue, secondaryCurrency, secondaryCurrency)}
        </p>
      )}
    </div>
  </div>
);

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
        {Math.abs(roi).toFixed(2)}%
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ringkasan Instrumen
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{summary.originalCurrencyCode}</Badge>
            {instrument.is_trackable ? (
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
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Wallet}
            label="Modal Aktif"
            tooltip="Dana yang saat ini masih aktif di instrumen ini dan belum ditarik."
            value={summary.activeCapital}
            currency={summary.originalCurrencyCode}
          />
          <MetricCard
            icon={BarChart3}
            label="Nilai Saat Ini"
            tooltip="Nilai total instrumen berdasarkan harga pasar terakhir."
            value={summary.currentValue}
            currency={summary.originalCurrencyCode}
            secondaryValue={summary.currentValueBaseCurrency}
            secondaryCurrency={summary.baseCurrencyCode}
            showSecondary={!isSameCurrency}
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Profit"
            tooltip="Total keuntungan dari instrumen ini (terealisasi + belum terealisasi)."
            value={summary.totalProfit}
            currency={summary.originalCurrencyCode}
            showSign={true}
            secondaryValue={summary.totalProfitBaseCurrency}
            secondaryCurrency={summary.baseCurrencyCode}
            showSecondary={!isSameCurrency}
          />
          <RoiCard
            roi={summary.roi}
            tooltip="Return on Investment dihitung berdasarkan currency instrumen (Total Profit / Modal Aktif × 100). Tidak memperhitungkan dampak perubahan kurs."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InstrumentSummaryHeader;

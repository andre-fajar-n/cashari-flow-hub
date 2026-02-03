import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Wallet, HelpCircle, PiggyBank } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { InstrumentDetailSummary } from "@/hooks/queries/use-instrument-detail-summary";

interface InstrumentCapitalBreakdownProps {
  summary: InstrumentDetailSummary;
}

const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center gap-1.5 cursor-help text-muted-foreground text-sm">
          {label}
          <HelpCircle className="w-3 h-3" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const MetricRow = ({
  label,
  tooltip,
  originalValue,
  originalCurrency,
  baseValue,
  baseCurrency,
  isMultiCurrency,
}: {
  label: string;
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue: number;
  baseCurrency: string;
  isMultiCurrency: boolean;
}) => {
  const isSameCurrency = originalCurrency === baseCurrency;
  
  return (
    <div className="flex justify-between items-start py-3 border-b last:border-b-0">
      <LabelWithTooltip label={label} tooltip={tooltip} />
      <div className="text-right">
        {isMultiCurrency ? (
          <>
            <p className="text-sm font-semibold">
              {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground italic">
              (base currency)
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">
              {formatAmountCurrency(originalValue, originalCurrency, originalCurrency)}
            </p>
            {!isSameCurrency && (
              <p className="text-xs text-muted-foreground italic">
                ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const InstrumentCapitalBreakdown = ({ summary }: InstrumentCapitalBreakdownProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer pb-3" onClick={() => setIsOpen(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="w-5 h-5" />
                Rincian Modal
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <MetricRow
              label="Total Modal Investasi"
              tooltip="Total dana yang pernah dimasukkan ke instrumen ini, termasuk dana yang sudah ditarik."
              originalValue={summary.totalInvestedCapital}
              originalCurrency={summary.originalCurrencyCode}
              baseValue={summary.investedCapitalBaseCurrency}
              baseCurrency={summary.baseCurrencyCode}
              isMultiCurrency={summary.isMultiCurrency}
            />
            <MetricRow
              label="Modal Aktif"
              tooltip="Dana yang saat ini masih tertanam di instrumen ini."
              originalValue={summary.activeCapital}
              originalCurrency={summary.originalCurrencyCode}
              baseValue={summary.activeCapitalBaseCurrency}
              baseCurrency={summary.baseCurrencyCode}
              isMultiCurrency={summary.isMultiCurrency}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default InstrumentCapitalBreakdown;
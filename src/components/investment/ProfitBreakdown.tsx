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
import { ChevronDown, ChevronUp, TrendingUp, HelpCircle, ChevronRight } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { DetailSummary } from "@/models/investment";
import { LabelWithTooltip, ProfitMetricRow } from "@/components/investment/ProfitMetricRow";

interface ProfitBreakdownProps {
  summary: DetailSummary;
}

export const ProfitBreakdown = ({ summary }: ProfitBreakdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnrealizedDetail, setShowUnrealizedDetail] = useState(false);

  const hasUnrealizedCurrencyProfit = summary.unrealizedCurrencyProfit !== 0;
  const totalUnrealizedProfitBaseCurrency = summary.unrealizedAssetProfit + summary.unrealizedCurrencyProfit;

  const showBaseOnly = summary.isMultiCurrency || summary.originalCurrencyCode === summary.baseCurrencyCode;
  const showedUnrealizedProfit = showBaseOnly ? totalUnrealizedProfitBaseCurrency : summary.unrealizedProfit;
  const showedCurrency = showBaseOnly ? summary.baseCurrencyCode : summary.originalCurrencyCode;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer pb-3" onClick={() => setIsOpen(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5" />
                Rincian Keuntungan
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Total Profit */}
            <ProfitMetricRow
              label="Total Profit"
              tooltip="Total keuntungan dari aset ini (terealisasi + belum terealisasi)."
              originalValue={summary.totalProfit}
              originalCurrency={summary.originalCurrencyCode}
              baseValue={summary.totalProfitBaseCurrency}
              baseCurrency={summary.baseCurrencyCode}
              showBaseOnly={showBaseOnly}
            />

            {/* Divider */}
            <div className="my-2 border-t border-dashed" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Breakdown</p>

            {/* Realized Profit */}
            <ProfitMetricRow
              label="Keuntungan Terealisasi"
              tooltip="Keuntungan yang sudah direalisasikan seperti dividen, bunga, atau penarikan dana."
              originalValue={summary.realizedProfit}
              originalCurrency={summary.originalCurrencyCode}
              baseValue={summary.realizedProfitBaseCurrency}
              baseCurrency={summary.baseCurrencyCode}
              showBaseOnly={showBaseOnly}
            />

            {/* Unrealized Profit - Expandable */}
            <div className="py-3 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1">
                  <LabelWithTooltip
                    label="Keuntungan Belum Terealisasi"
                    tooltip="Keuntungan yang masih mengikuti pergerakan harga aset dan nilai tukar."
                  />
                  {hasUnrealizedCurrencyProfit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUnrealizedDetail(!showUnrealizedDetail);
                      }}
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform ${showUnrealizedDetail ? 'rotate-90' : ''}`} />
                    </Button>
                  )}
                </div>
                <div className="text-right">
                  <AmountText
                    amount={showedUnrealizedProfit}
                    showSign={true}
                    className="text-sm font-semibold"
                  >
                    {formatAmountCurrency(Math.abs(showedUnrealizedProfit), showedCurrency, showedCurrency)}
                  </AmountText>
                  {!showBaseOnly && (
                    <p className="text-xs text-muted-foreground italic">
                      ≈ {formatAmountCurrency(totalUnrealizedProfitBaseCurrency, summary.baseCurrencyCode, summary.baseCurrencyCode)}
                    </p>
                  )}
                </div>
              </div>

              {/* Unrealized Detail Breakdown */}
              {showUnrealizedDetail && hasUnrealizedCurrencyProfit && (
                <div className="mt-3 ml-4 p-3 rounded-md bg-muted/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Keuntungan Aset
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Keuntungan karena perubahan harga aset.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <AmountText
                      amount={summary.unrealizedAssetProfit}
                      showSign={true}
                      className="text-xs font-medium"
                    >
                      {formatAmountCurrency(Math.abs(summary.unrealizedAssetProfit), summary.baseCurrencyCode, summary.baseCurrencyCode)}
                    </AmountText>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Keuntungan Kurs
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Keuntungan karena perubahan nilai tukar mata uang.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <AmountText
                      amount={summary.unrealizedCurrencyProfit}
                      showSign={true}
                      className="text-xs font-medium"
                    >
                      {formatAmountCurrency(Math.abs(summary.unrealizedCurrencyProfit), summary.baseCurrencyCode, summary.baseCurrencyCode)}
                    </AmountText>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ProfitBreakdown;

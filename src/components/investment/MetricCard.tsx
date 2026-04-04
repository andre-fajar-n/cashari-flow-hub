import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import AmountText from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";

export const MetricCard = ({
  icon: Icon,
  label,
  tooltip,
  originalValue,
  originalCurrency,
  baseValue,
  baseCurrency,
  showSign = false,
  showBaseOnly = false,
}: {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue?: number;
  baseCurrency?: string;
  showSign?: boolean;
  showBaseOnly?: boolean;
}) => {
  const showedValue = showBaseOnly ? (baseValue ?? 0) : originalValue;
  const showedCurrency = showBaseOnly ? (baseCurrency ?? originalCurrency) : originalCurrency;

  const isPositive = showSign && showedValue > 0;
  const isNegative = showSign && showedValue < 0;

  return (
    <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-md shrink-0 ${
          isPositive ? 'bg-green-500/10' : isNegative ? 'bg-red-500/10' : 'bg-primary/10'
        }`}>
          <Icon className={`w-3.5 h-3.5 ${
            isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-primary'
          }`} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help font-medium">
                {label}
                <HelpCircle className="w-3 h-3 shrink-0" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-0.5">
        {showSign ? (
          <AmountText amount={showedValue} showSign={true} className="text-lg font-bold">
            {formatAmountCurrency(Math.abs(showedValue), showedCurrency, showedCurrency)}
          </AmountText>
        ) : (
          <p className="text-lg font-bold">
            {formatAmountCurrency(showedValue, showedCurrency, showedCurrency)}
          </p>
        )}
        {!showBaseOnly && (
          <p className="text-xs text-muted-foreground">
            ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};

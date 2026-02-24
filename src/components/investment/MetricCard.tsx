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
  const showedValue = showBaseOnly ? baseValue : originalValue;
  const showedCurrency = showBaseOnly ? baseCurrency : originalCurrency;

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
          <AmountText amount={showedValue} showSign={true} className="text-xl font-bold">
            {formatAmountCurrency(Math.abs(showedValue), showedCurrency, showedCurrency)}
          </AmountText>
        ) : (
          <p className="text-xl font-bold">
            {formatAmountCurrency(showedValue, showedCurrency, showedCurrency)}
          </p>
        )}
        {!showBaseOnly && (
          <p className="text-xs text-muted-foreground italic mt-0.5">
            ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};

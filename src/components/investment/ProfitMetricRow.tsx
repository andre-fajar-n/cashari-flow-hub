import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
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

export const ProfitMetricRow = ({
  label,
  tooltip,
  originalValue,
  originalCurrency,
  baseValue,
  baseCurrency,
  showBaseOnly = false,
}: {
  label: string;
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue: number;
  baseCurrency: string;
  showBaseOnly?: boolean;
}) => {
  const showedValue = showBaseOnly ? baseValue : originalValue;
  const showedCurrency = showBaseOnly ? baseCurrency : originalCurrency;

  return (
    <div className="flex justify-between items-start py-3 border-b last:border-b-0">
      <LabelWithTooltip label={label} tooltip={tooltip} />
      <div className="text-right">
        <AmountText amount={showedValue} showSign={true} className="text-sm font-semibold">
          {formatAmountCurrency(Math.abs(showedValue), showedCurrency, showedCurrency)}
        </AmountText>
        {!showBaseOnly && (
          <p className="text-xs text-muted-foreground italic">
            ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};

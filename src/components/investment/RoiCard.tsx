import { Percent, HelpCircle } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import AmountText from "@/components/ui/amount-text";
import { formatPercentage } from "@/lib/number";

export const RoiCard = ({
  roi,
  label,
  tooltip,
}: {
  roi: number | null;
  label: string;
  tooltip: string;
}) => {
  const isPositive = roi !== null && roi > 0;
  const isNegative = roi !== null && roi < 0;

  return (
    <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-md shrink-0 ${
          isPositive ? 'bg-green-500/10' : isNegative ? 'bg-red-500/10' : 'bg-muted'
        }`}>
          <Percent className={`w-3.5 h-3.5 ${
            isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
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
      {roi !== null ? (
        <AmountText amount={roi} showSign={true} className="text-lg font-bold">
          {formatPercentage(Math.abs(roi))}%
        </AmountText>
      ) : (
        <p className="text-lg font-bold text-muted-foreground">—</p>
      )}
    </div>
  );
};

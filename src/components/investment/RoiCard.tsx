import { Percent } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
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

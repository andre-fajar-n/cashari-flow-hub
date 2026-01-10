import { RefreshCw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePendingExchangeRates } from "@/hooks/queries/use-pending-exchange-rates";
import { useFetchExchangeRates } from "@/hooks/mutations/use-fetch-exchange-rates";

const FetchExchangeRatesButton = () => {
  const { pendingCount, hasPendingRates, isLoading: isChecking } = usePendingExchangeRates();
  const { mutate: fetchRates, isPending: isFetching } = useFetchExchangeRates();

  const handleClick = () => {
    if (!isFetching && hasPendingRates) {
      fetchRates();
    }
  };

  // Don't show if still checking or no currency pairs exist
  if (isChecking) {
    return (
      <Button variant="ghost" size="icon" disabled className="relative">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const tooltipContent = hasPendingRates
    ? `Update exchange rates - ${pendingCount} pasangan belum ada rate hari ini`
    : "Semua exchange rates sudah ter-update untuk hari ini";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={!hasPendingRates || isFetching}
            className="relative"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasPendingRates ? (
              <>
                <RefreshCw className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
                >
                  {pendingCount}
                </Badge>
              </>
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FetchExchangeRatesButton;

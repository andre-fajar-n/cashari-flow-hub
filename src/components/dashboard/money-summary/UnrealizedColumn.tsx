import { formatAmountCurrency } from "@/lib/currency";
import { AmountDisplayData } from "./types";

interface UnrealizedColumnProps {
  data: AmountDisplayData;
}

export const UnrealizedColumn = ({ data }: UnrealizedColumnProps) => (
  <div className="text-right space-y-1">
    <div className="text-xs text-muted-foreground font-medium">Unrealized</div>
    {data.unrealizedAmount !== 0 ? (
      <div className="space-y-1">
        <div className={`font-semibold ${data.unrealizedAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.unrealizedAmount >= 0 ? '+' : ''}
          {formatAmountCurrency(data.unrealizedAmount, data.currency)}
        </div>
        {data.showBaseCurrency && data.baseCurrency && data.exchangeRate && (
          <div className={`text-xs font-medium ${data.unrealizedAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.unrealizedAmount >= 0 ? '+' : ''}
            {formatAmountCurrency(data.unrealizedAmount * data.exchangeRate, data.baseCurrency)}
          </div>
        )}
      </div>
    ) : (
      <div className="text-muted-foreground">-</div>
    )}
  </div>
);

import { formatAmountCurrency } from "@/lib/currency";
import { AmountDisplayData } from "@/components/dashboard/money-summary/types";

interface UnrealizedColumnProps {
  data: AmountDisplayData;
}

export const UnrealizedColumn = ({ data }: UnrealizedColumnProps) => {
  const hasUnrealizedProfit = data.unrealized_profit !== 0 ||
    data.unrealized_asset_profit_base_currency !== 0 ||
    data.unrealized_currency_profit !== 0;

  const mapSignAndTextColor = (value: number) => {
    if (value > 0) {
      return {
        sign: '+',
        textColor: 'text-green-600'
      };
    } else if (value < 0) {
      return {
        sign: '',
        textColor: 'text-red-600'
      };
    } else {
      return {
        sign: '',
        textColor: 'text-600'
      };
    }
  };

  const signAndTextColorUnrealizedProfit = mapSignAndTextColor(data.unrealized_profit);
  const signAndTextColorAsset = mapSignAndTextColor(data.unrealized_asset_profit_base_currency);
  const signAndTextColorCurrency = mapSignAndTextColor(data.unrealized_currency_profit);

  return (
    <div className="text-center space-y-1">
      <div className="text-xs text-muted-foreground font-medium">Belum Terealisasi</div>
      {hasUnrealizedProfit ? (
        <div className="space-y-1">
          <div className={`font-semibold ${signAndTextColorUnrealizedProfit.textColor}`}>
            {signAndTextColorUnrealizedProfit.sign}
            {formatAmountCurrency(data.unrealized_profit, data.currency, data.currencySymbol)}
          </div>

          {/* Breakdown in base currency */}
          {data.showBaseCurrency && data.baseCurrency && (
            <div className="text-[10px] space-y-0.5 mt-1 border-t pt-1">
              <div className={`flex justify-between gap-2 ${signAndTextColorAsset.textColor}`}>
                <span>Aset:</span>
                <span>
                  {signAndTextColorAsset.sign}
                  {formatAmountCurrency(data.unrealized_asset_profit_base_currency, data.baseCurrency, data.baseCurrencySymbol)}
                </span>
              </div>
              <div className={`flex justify-between gap-2 ${signAndTextColorCurrency.textColor}`}>
                <span>Kurs:</span>
                <span>
                  {signAndTextColorCurrency.sign}
                  {formatAmountCurrency(data.unrealized_currency_profit, data.baseCurrency, data.baseCurrencySymbol)}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      )}
    </div>
  )
};

import { formatAmountCurrency } from "@/lib/currency";
import { AmountDisplayData } from "@/components/dashboard/money-summary/types";

interface UnrealizedColumnProps {
  data: AmountDisplayData;
}

export const UnrealizedColumn = ({ data }: UnrealizedColumnProps) => (
  <div className="text-center space-y-1">
    <div className="text-xs text-muted-foreground font-medium">Belum Terealisasi</div>
    {data.unrealized_profit !== 0 ? (
      <div className="space-y-1">
        <div className={`font-semibold ${data.unrealized_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.unrealized_profit >= 0 ? '+' : ''}
          {formatAmountCurrency(data.unrealized_profit, data.currency, data.currencySymbol)}
        </div>

        {/* Breakdown in base currency */}
        {data.showBaseCurrency && data.baseCurrency && (
          <div className="text-[10px] space-y-0.5 mt-1 border-t pt-1">
            {data.unrealized_asset_profit_base_currency !== 0 && (
              <div className={`flex justify-between gap-2 ${data.unrealized_asset_profit_base_currency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Aset:</span>
                <span>
                  {data.unrealized_asset_profit_base_currency >= 0 ? '+' : ''}
                  {formatAmountCurrency(data.unrealized_asset_profit_base_currency, data.baseCurrency, data.baseCurrencySymbol)}
                </span>
              </div>
            )}
            {data.unrealized_currency_profit !== 0 && (
              <div className={`flex justify-between gap-2 ${data.unrealized_currency_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Kurs:</span>
                <span>
                  {data.unrealized_currency_profit >= 0 ? '+' : ''}
                  {formatAmountCurrency(data.unrealized_currency_profit, data.baseCurrency, data.baseCurrencySymbol)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    ) : (
      <div className="text-muted-foreground">-</div>
    )}
  </div>
);

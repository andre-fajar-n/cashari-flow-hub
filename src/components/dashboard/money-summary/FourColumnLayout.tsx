import { InfoColumn } from "@/components/dashboard/money-summary/InfoColumn";
import { AmountColumn } from "@/components/dashboard/money-summary/AmountColumn";
import { UnrealizedColumn } from "@/components/dashboard/money-summary/UnrealizedColumn";
import { InfoColumnData, AmountDisplayData } from "@/components/dashboard/money-summary/types";

interface FourColumnLayoutProps {
  infoData: InfoColumnData;
  amountData: AmountDisplayData;
}

export const FourColumnLayout = ({
  infoData,
  amountData,
}: FourColumnLayoutProps) => (
  <div className="grid grid-cols-4 gap-3 items-start">
    <InfoColumn data={infoData} />

    {amountData.unrealized_profit === 0 ? (
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground font-medium">Nilai Awal</div>
        <div className="font-semibold">-</div>
      </div>
    ) : (
      <AmountColumn
        label="Nilai Awal"
        amount={amountData.active_capital}
        currency={amountData.currency}
        currencySymbol={amountData.currencySymbol}
        baseCurrencyAmount={amountData.showBaseCurrency ? amountData.active_capital_base_currency : undefined}
        baseCurrency={amountData.baseCurrency}
        baseCurrencySymbol={amountData.baseCurrencySymbol}
        showBaseCurrency={amountData.showBaseCurrency}
      />
    )}

    <UnrealizedColumn data={amountData} />

    <AmountColumn
      label="Nilai Akhir"
      amount={amountData.current_value}
      currency={amountData.currency}
      currencySymbol={amountData.currencySymbol}
      baseCurrencyAmount={amountData.showBaseCurrency ? amountData.current_value_base_currency : undefined}
      baseCurrency={amountData.baseCurrency}
      baseCurrencySymbol={amountData.baseCurrencySymbol}
      showBaseCurrency={amountData.showBaseCurrency}
    />
  </div>
);

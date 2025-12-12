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

    {amountData.originalAmount === amountData.calculatedAmount ? (
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground font-medium">Amount Awal</div>
        <div className="font-semibold">-</div>
      </div>
    ) : (
      <AmountColumn
        label="Amount Awal"
        amount={amountData.originalAmount}
        currency={amountData.currency}
        currencySymbol={amountData.currencySymbol}
        baseCurrencyAmount={amountData.showBaseCurrency ? amountData.originalAmount * (amountData.exchangeRate || 0) : undefined}
        baseCurrency={amountData.baseCurrency}
        baseCurrencySymbol={amountData.baseCurrencySymbol}
        showBaseCurrency={amountData.showBaseCurrency}
      />
    )}

    <UnrealizedColumn data={amountData} />

    <AmountColumn
      label="Amount Akhir"
      amount={amountData.calculatedAmount}
      currency={amountData.currency}
      currencySymbol={amountData.currencySymbol}
      baseCurrencyAmount={amountData.showBaseCurrency ? amountData.calculatedAmount * (amountData.exchangeRate || 0) : undefined}
      baseCurrency={amountData.baseCurrency}
      baseCurrencySymbol={amountData.baseCurrencySymbol}
      showBaseCurrency={amountData.showBaseCurrency}
    />
  </div>
);

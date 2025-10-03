import { InfoColumn } from "@/components/dashboard/money-summary/InfoColumn";
import { AmountColumn } from "@/components/dashboard/money-summary/AmountColumn";
import { UnrealizedColumn } from "@/components/dashboard/money-summary/UnrealizedColumn";
import { InfoColumnData, AmountDisplayData } from "@/components/dashboard/money-summary/types";

interface FourColumnLayoutProps {
  infoData: InfoColumnData;
  amountData: AmountDisplayData;
  hasAsset?: boolean;
}

export const FourColumnLayout = ({ 
  infoData, 
  amountData, 
  hasAsset = false 
}: FourColumnLayoutProps) => (
  <div className="grid grid-cols-4 gap-3 items-start">
    <InfoColumn data={infoData} />
    
    <AmountColumn
      label="Amount Asli"
      amount={amountData.originalAmount}
      currency={amountData.currency}
      baseCurrencyAmount={amountData.showBaseCurrency ? amountData.originalAmount * (amountData.exchangeRate || 0) : undefined}
      baseCurrency={amountData.baseCurrency}
      showBaseCurrency={amountData.showBaseCurrency}
    />
    
    <AmountColumn
      label={hasAsset ? "Nilai Aset" : "Saldo"}
      amount={amountData.calculatedAmount}
      currency={amountData.currency}
      baseCurrencyAmount={amountData.showBaseCurrency ? amountData.calculatedAmount * (amountData.exchangeRate || 0) : undefined}
      baseCurrency={amountData.baseCurrency}
      showBaseCurrency={amountData.showBaseCurrency}
    />
    
    <UnrealizedColumn data={amountData} />
  </div>
);

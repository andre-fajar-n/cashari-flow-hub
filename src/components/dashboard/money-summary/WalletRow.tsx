import { ChevronDown, ChevronRight } from "lucide-react";
import { AmountColumn } from "@/components/dashboard/money-summary/AmountColumn";
import { UnrealizedColumn } from "@/components/dashboard/money-summary/UnrealizedColumn";
import { WalletSummary } from "@/models/money-summary";

interface WalletRowProps {
  wallet: WalletSummary;
  isExpanded: boolean;
}

export const WalletRow = ({ wallet, isExpanded }: WalletRowProps) => (
  <div className="grid grid-cols-4 gap-3 items-center">
    {/* Column 1: Wallet Info with Chevron */}
    <div className="flex items-center gap-2">
      {isExpanded ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
      <div>
        <h5 className="font-medium">{wallet.wallet_name}</h5>
        <div className="text-xs text-muted-foreground">{wallet.original_currency_code}</div>
      </div>
    </div>

    {/* Column 2: Original Amount */}
    <AmountColumn
      label="Amount Asli"
      amount={wallet.originalAmount}
      currency={wallet.original_currency_code}
      baseCurrencyAmount={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code ? wallet.originalAmount * wallet.latest_rate : undefined}
      baseCurrency={wallet.base_currency_code}
      showBaseCurrency={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code}
    />

    {/* Column 3: Calculated Amount */}
    <AmountColumn
      label="Nilai Terhitung"
      amount={wallet.calculatedAmount}
      currency={wallet.original_currency_code}
      baseCurrencyAmount={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code ? wallet.calculatedAmount * wallet.latest_rate : undefined}
      baseCurrency={wallet.base_currency_code}
      showBaseCurrency={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code}
    />

    {/* Column 4: Unrealized Amount */}
    <UnrealizedColumn 
      data={{
        originalAmount: wallet.originalAmount,
        calculatedAmount: wallet.calculatedAmount,
        unrealizedAmount: wallet.unrealizedAmount,
        currency: wallet.original_currency_code,
        baseCurrency: wallet.base_currency_code,
        exchangeRate: wallet.latest_rate || 0,
        showBaseCurrency: wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code
      }} 
    />
  </div>
);

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
    <div className="relative flex items-center">
      {/* Chevron positioned at the left */}
      <div className="absolute left-0">
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </div>
      {/* Content centered with left padding to avoid chevron overlap */}
      <div className="flex-1 text-center pl-6">
        <h5 className="font-medium">{wallet.wallet_name}</h5>
        <div className="text-xs text-muted-foreground">{wallet.original_currency_code}</div>
      </div>
    </div>

    {/* Column 2: Original Amount */}
    {wallet.originalAmount === wallet.calculatedAmount ? (
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground font-medium">Amount Awal</div>
        <div className="font-semibold">-</div>
      </div>
    ) : (
      <AmountColumn
        label="Amount Awal"
        amount={wallet.originalAmount}
        currency={wallet.original_currency_code}
        currencySymbol={wallet.original_currency_symbol}
        baseCurrencyAmount={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code ? wallet.originalAmount * wallet.latest_rate : undefined}
        baseCurrency={wallet.base_currency_code}
        baseCurrencySymbol={wallet.base_currency_symbol}
        showBaseCurrency={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code}
      />
    )}

    {/* Column 3: Unrealized Amount */}
    <UnrealizedColumn
      data={{
        originalAmount: wallet.originalAmount,
        calculatedAmount: wallet.calculatedAmount,
        unrealizedAmount: wallet.unrealizedAmount,
        currency: wallet.original_currency_code,
        currencySymbol: wallet.original_currency_symbol,
        baseCurrency: wallet.base_currency_code,
        baseCurrencySymbol: wallet.base_currency_symbol,
        exchangeRate: wallet.latest_rate || 0,
        showBaseCurrency: wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code
      }}
    />

    {/* Column 4: Calculated Amount */}
    <AmountColumn
      label="Amount Akhir"
      amount={wallet.calculatedAmount}
      currency={wallet.original_currency_code}
      currencySymbol={wallet.original_currency_symbol}
      baseCurrencyAmount={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code ? wallet.calculatedAmount * wallet.latest_rate : undefined}
      baseCurrency={wallet.base_currency_code}
      baseCurrencySymbol={wallet.base_currency_symbol}
      showBaseCurrency={wallet.latest_rate && wallet.base_currency_code !== wallet.original_currency_code}
    />
  </div>
);

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
    <AmountColumn
      label="Nilai Awal"
      amount={wallet.active_capital}
      currency={wallet.original_currency_code}
      currencySymbol={wallet.original_currency_symbol}
      baseCurrencyAmount={wallet.base_currency_code !== wallet.original_currency_code ? wallet.active_capital_base_currency : undefined}
      baseCurrency={wallet.base_currency_code || undefined}
      baseCurrencySymbol={wallet.base_currency_symbol || undefined}
      showBaseCurrency={wallet.base_currency_code !== wallet.original_currency_code}
    />

    {/* Column 3: Unrealized Amount */}
    <UnrealizedColumn
      data={{
        originalAmount: wallet.originalAmount,
        calculatedAmount: wallet.calculatedAmount,
        unrealizedAmount: wallet.unrealizedAmount,
        active_capital: wallet.active_capital,
        active_capital_base_currency: wallet.active_capital_base_currency,
        unrealized_profit: wallet.unrealized_profit,
        unrealized_asset_profit_base_currency: wallet.unrealized_asset_profit_base_currency,
        unrealized_currency_profit: wallet.unrealized_currency_profit,
        current_value: wallet.current_value,
        current_value_base_currency: wallet.current_value_base_currency,
        currency: wallet.original_currency_code,
        currencySymbol: wallet.original_currency_symbol,
        baseCurrency: wallet.base_currency_code || undefined,
        baseCurrencySymbol: wallet.base_currency_symbol || undefined,
        exchangeRate: wallet.latest_rate || 0,
        showBaseCurrency: wallet.base_currency_code !== wallet.original_currency_code
      }}
    />

    {/* Column 4: Calculated Amount */}
    <AmountColumn
      label="Nilai Akhir"
      amount={wallet.current_value}
      currency={wallet.original_currency_code}
      currencySymbol={wallet.original_currency_symbol}
      baseCurrencyAmount={wallet.base_currency_code !== wallet.original_currency_code ? wallet.current_value_base_currency : undefined}
      baseCurrency={wallet.base_currency_code || undefined}
      baseCurrencySymbol={wallet.base_currency_symbol || undefined}
      showBaseCurrency={wallet.base_currency_code !== wallet.original_currency_code}
    />
  </div>
);

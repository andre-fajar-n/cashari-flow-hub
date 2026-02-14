import { ChevronDown, ChevronRight } from "lucide-react";
import { AmountColumn } from "@/components/dashboard/money-summary/AmountColumn";
import { UnrealizedColumn } from "@/components/dashboard/money-summary/UnrealizedColumn";
import { InstrumentSummary } from "@/models/money-summary";

interface InstrumentRowProps {
  instrument: InstrumentSummary;
  isExpanded: boolean;
}

export const InstrumentRow = ({ instrument, isExpanded }: InstrumentRowProps) => (
  <div className="grid grid-cols-4 gap-3 items-center">
    {/* Column 1: Instrument Info with Chevron */}
    <div className="relative flex items-center">
      {/* Chevron positioned at the left */}
      <div className="absolute left-0">
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </div>
      {/* Content centered with left padding to avoid chevron overlap */}
      <div className="flex-1 text-center pl-6">
        <div className="font-medium text-purple-600">{instrument.instrument_name}</div>
        <div className="text-xs text-muted-foreground">{instrument.original_currency_code}</div>
      </div>
    </div>

    {/* Column 2: Original Amount */}
    {instrument.unrealized_profit === 0 ? (
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground font-medium">Nilai Awal</div>
        <div className="font-semibold">-</div>
      </div>
    ) : (
      <AmountColumn
        label="Nilai Awal"
        amount={instrument.active_capital}
        currency={instrument.original_currency_code}
        currencySymbol={instrument.original_currency_symbol}
        baseCurrencyAmount={instrument.base_currency_code !== instrument.original_currency_code ? instrument.active_capital_base_currency : undefined}
        baseCurrency={instrument.base_currency_code || undefined}
        baseCurrencySymbol={instrument.base_currency_symbol || undefined}
        showBaseCurrency={instrument.base_currency_code !== instrument.original_currency_code}
      />
    )}

    {/* Column 3: Unrealized Amount */}
    <UnrealizedColumn
      data={{
        originalAmount: instrument.originalAmount,
        calculatedAmount: instrument.calculatedAmount,
        unrealizedAmount: instrument.unrealizedAmount,
        active_capital: instrument.active_capital,
        active_capital_base_currency: instrument.active_capital_base_currency,
        unrealized_profit: instrument.unrealized_profit,
        unrealized_asset_profit_base_currency: instrument.unrealized_asset_profit_base_currency,
        unrealized_currency_profit: instrument.unrealized_currency_profit,
        current_value: instrument.current_value,
        current_value_base_currency: instrument.current_value_base_currency,
        currency: instrument.original_currency_code,
        currencySymbol: instrument.original_currency_symbol,
        baseCurrency: instrument.base_currency_code || undefined,
        baseCurrencySymbol: instrument.base_currency_symbol || undefined,
        exchangeRate: instrument.latest_rate || 0,
        showBaseCurrency: instrument.base_currency_code !== instrument.original_currency_code
      }}
    />

    {/* Column 4: Calculated Amount */}
    <AmountColumn
      label="Nilai Akhir"
      amount={instrument.current_value}
      currency={instrument.original_currency_code}
      currencySymbol={instrument.original_currency_symbol}
      baseCurrencyAmount={instrument.base_currency_code !== instrument.original_currency_code ? instrument.current_value_base_currency : undefined}
      baseCurrency={instrument.base_currency_code || undefined}
      baseCurrencySymbol={instrument.base_currency_symbol || undefined}
      showBaseCurrency={instrument.base_currency_code !== instrument.original_currency_code}
    />
  </div>
);

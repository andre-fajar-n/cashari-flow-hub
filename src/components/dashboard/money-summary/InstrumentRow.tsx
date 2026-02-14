import { ChevronDown, ChevronRight } from "lucide-react";
import { AmountColumn } from "@/components/dashboard/money-summary/AmountColumn";
import { UnrealizedColumn } from "@/components/dashboard/money-summary/UnrealizedColumn";

interface InstrumentRowProps {
  instrument: any; // TODO: Add proper type from models
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
    {instrument.originalAmount === instrument.calculatedAmount ? (
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground font-medium">Nilai Awal</div>
        <div className="font-semibold">-</div>
      </div>
    ) : (
      <AmountColumn
        label="Nilai Awal"
        amount={instrument.originalAmount}
        currency={instrument.original_currency_code}
        currencySymbol={instrument.original_currency_code}
        baseCurrencyAmount={instrument.latest_rate && instrument.base_currency_code !== instrument.original_currency_code ? instrument.originalAmount * instrument.latest_rate : undefined}
        baseCurrency={instrument.base_currency_code}
        baseCurrencySymbol={instrument.base_currency_code}
        showBaseCurrency={instrument.latest_rate && instrument.base_currency_code !== instrument.original_currency_code}
      />
    )}

    {/* Column 3: Unrealized Amount */}
    <UnrealizedColumn
      data={{
        originalAmount: instrument.originalAmount,
        calculatedAmount: instrument.calculatedAmount,
        unrealizedAmount: instrument.unrealizedAmount,
        currency: instrument.original_currency_code,
        currencySymbol: instrument.original_currency_code,
        baseCurrency: instrument.base_currency_code,
        baseCurrencySymbol: instrument.base_currency_code,
        exchangeRate: instrument.latest_rate || 0,
        showBaseCurrency: instrument.latest_rate && instrument.base_currency_code !== instrument.original_currency_code
      }}
    />

    {/* Column 4: Calculated Amount */}
    <AmountColumn
      label="Nilai Akhir"
      amount={instrument.calculatedAmount}
      currency={instrument.original_currency_code}
      currencySymbol={instrument.original_currency_code}
      baseCurrencyAmount={instrument.latest_rate && instrument.base_currency_code !== instrument.original_currency_code ? instrument.calculatedAmount * instrument.latest_rate : undefined}
      baseCurrency={instrument.base_currency_code}
      baseCurrencySymbol={instrument.base_currency_code}
      showBaseCurrency={instrument.latest_rate && instrument.base_currency_code !== instrument.original_currency_code}
    />
  </div>
);

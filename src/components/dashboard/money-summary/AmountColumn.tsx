import { formatAmountCurrency } from "@/lib/currency";

interface AmountColumnProps {
  label: string;
  amount: number;
  currency: string;
  baseCurrencyAmount?: number;
  baseCurrency?: string;
  showBaseCurrency?: boolean;
  alignment?: "left" | "center" | "right";
}

export const AmountColumn = ({ 
  label, 
  amount, 
  currency, 
  baseCurrencyAmount, 
  baseCurrency, 
  showBaseCurrency = false,
  alignment = "center" 
}: AmountColumnProps) => (
  <div className={`space-y-1 ${alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : ""}`}>
    <div className="text-xs text-muted-foreground font-medium">{label}</div>
    <div className="font-semibold">
      {formatAmountCurrency(amount, currency)}
    </div>
    {showBaseCurrency && baseCurrencyAmount !== undefined && baseCurrency && (
      <div className="text-xs text-muted-foreground">
        {formatAmountCurrency(baseCurrencyAmount, baseCurrency)}
      </div>
    )}
  </div>
);

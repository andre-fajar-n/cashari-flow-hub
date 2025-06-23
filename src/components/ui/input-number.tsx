
import * as React from "react"
import { forwardRef } from "react";

import { cn } from "@/lib/utils"

export interface InputNumberProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: number | string;
  onChange?: (value: number) => void;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, onChange, value, autoComplete = "off", ...props }, ref) => {
    const formatNumber = (num: string) => {
      const isNegative = num.startsWith('-');

      // Remove any non-digit characters
      const digitsOnly = num.replace(/\D/g, '');

      if (digitsOnly === '') return isNegative ? '-' : '';

      const formatted = parseInt(digitsOnly, 10).toLocaleString('id-ID');
      return isNegative ? `-${formatted}` : formatted;
    };

    const parseNumber = (formattedNum: string) => {
      const isNegative = formattedNum.trim().startsWith('-');
      const numeric = parseInt(formattedNum.replace(/[^0-9]/g, ''), 10) || 0;
      return isNegative ? -numeric : numeric;
    };
    
    const [displayValue, setDisplayValue] = React.useState<string>(
      value ? formatNumber(String(value)) : ""
    );

    React.useEffect(() => {
      setDisplayValue(value ? formatNumber(String(value)) : "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow empty string or just "-"
      if (newValue === "" || newValue === "-") {
        setDisplayValue(newValue);
        if (onChange) {
          onChange(0); // optional: you can return NaN or null if "-" only
        }
        return;
      }

      const isNegative = newValue.startsWith('-');
      const digitsOnly = newValue.replace(/\D/g, '');

      if (digitsOnly !== '') {
        const raw = isNegative ? `-${digitsOnly}` : digitsOnly;
        const formatted = formatNumber(raw);
        setDisplayValue(formatted);

        if (onChange) {
          const numericValue = parseNumber(formatted);
          onChange(numericValue);
        }
      }
    };

    return (
      <input
        type="text"
        value={displayValue}
        autoComplete={autoComplete}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        placeholder="0"
        inputMode="numeric"
        ref={ref}
        {...props}
      />
    )
  }
)
InputNumber.displayName = "InputNumber"

export { InputNumber }

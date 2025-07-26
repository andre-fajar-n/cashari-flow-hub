
import * as React from "react"
import { forwardRef } from "react";

import { cn } from "@/lib/utils"

export interface InputNumberProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: number | string;
  onChange?: (value: number) => void;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, onChange, value, autoComplete = "off", ...props }, ref) => {
    const formatNumber = (num: string | number): string => {
      if (num === "" || num === null || num === undefined) return "";

      const numValue = typeof num === 'string' ? parseFloat(num) : num;
      if (isNaN(numValue)) return "";

      // Use Indonesian locale formatting
      return numValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10
      });
    };

    const parseNumber = (formattedStr: string): number => {
      if (!formattedStr || formattedStr === "" || formattedStr === "-") return 0;

      // Remove thousand separators (dots) and replace comma with dot for decimal
      const cleanStr = formattedStr.replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleanStr);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    const [displayValue, setDisplayValue] = React.useState<string>(
      value ? formatNumber(String(value)) : ""
    );

    React.useEffect(() => {
      setDisplayValue(value ? formatNumber(String(value)) : "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty string
      if (inputValue === "") {
        setDisplayValue("");
        if (onChange) {
          onChange(0);
        }
        return;
      }

      // Allow only numbers, dots, commas, and minus sign
      const validPattern = /^-?[\d.,]*$/;
      if (!validPattern.test(inputValue)) {
        return; // Reject invalid characters
      }

      // Prevent multiple commas (decimal separators)
      const commaCount = (inputValue.match(/,/g) || []).length;
      if (commaCount > 1) {
        return;
      }

      // Set display value as user types
      setDisplayValue(inputValue);

      // Parse and send numeric value to parent
      if (onChange) {
        const numericValue = parseNumber(inputValue);
        onChange(numericValue);
      }
    };

    const handleBlur = () => {
      // Format the number when user finishes typing
      if (displayValue && displayValue !== "" && displayValue !== "-") {
        const numericValue = parseNumber(displayValue);
        if (!isNaN(numericValue)) {
          const formatted = formatNumber(numericValue);
          setDisplayValue(formatted);
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
        onBlur={handleBlur}
        placeholder="0"
        inputMode="decimal"
        ref={ref}
        {...props}
      />
    )
  }
)
InputNumber.displayName = "InputNumber"

export { InputNumber }

import * as React from "react"
import { forwardRef } from "react";

import { cn } from "@/lib/utils"

export interface InputDecimalProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: number | string;
  onChange?: (value: number) => void;
}

const InputDecimal = forwardRef<HTMLInputElement, InputDecimalProps>(
  ({ className, onChange, value, autoComplete = "off", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [isFocused, setIsFocused] = React.useState<boolean>(false);

    // Format number to Indonesian format (1.234.567,89)
    const formatToIndonesian = (num: number): string => {
      if (isNaN(num)) return "";

      const parts = num.toString().split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];

      // Add thousand separators (dots)
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // Add decimal part with comma if exists
      if (decimalPart) {
        return `${formattedInteger},${decimalPart}`;
      }

      return formattedInteger;
    };

    // Parse Indonesian format back to number
    const parseFromIndonesian = (str: string): number => {
      if (!str || str === "" || str === "-") return 0;

      // Replace dots (thousand separators) and comma (decimal) with standard format
      const standardFormat = str.replace(/\./g, '').replace(',', '.');
      return parseFloat(standardFormat) || 0;
    };

    // Initialize display value
    React.useEffect(() => {
      if (value !== undefined && value !== null && value !== "") {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isFocused && !isNaN(numValue)) {
          setDisplayValue(formatToIndonesian(numValue));
        } else if (isFocused) {
          // When focused, show raw format for easier editing
          setDisplayValue(String(numValue));
        }
      } else {
        setDisplayValue("");
      }
    }, [value, isFocused]);

    const handleFocus = () => {
      setIsFocused(true);
      // Convert to raw format for editing
      if (displayValue) {
        const numValue = parseFromIndonesian(displayValue);
        setDisplayValue(String(numValue));
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Format to Indonesian format for display
      if (displayValue && displayValue !== "" && displayValue !== "-" && displayValue !== ".") {
        const numericValue = parseFloat(displayValue);
        if (!isNaN(numericValue)) {
          setDisplayValue(formatToIndonesian(numericValue));
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow empty string
      if (newValue === "") {
        setDisplayValue("");
        if (onChange) {
          onChange(0);
        }
        return;
      }

      // When focused, allow raw number input (with . as decimal)
      const validChars = /^-?\d*\.?\d*$/;
      if (validChars.test(newValue)) {
        setDisplayValue(newValue);

        if (onChange) {
          const numericValue = parseFloat(newValue) || 0;
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="0"
        inputMode="decimal"
        ref={ref}
        {...props}
      />
    )
  }
)
InputDecimal.displayName = "InputDecimal"

export { InputDecimal }

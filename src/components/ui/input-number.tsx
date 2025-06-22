
import * as React from "react"
import { forwardRef } from "react";

import { cn } from "@/lib/utils"

export interface InputNumberProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: number | string;
  onChange?: (value: number) => void;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, onChange, value, autoComplete = "off", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      value ? String(value) : ""
    );

    React.useEffect(() => {
      setDisplayValue(value ? String(value) : "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow empty string or valid numbers
      if (newValue === "" || /^\d+$/.test(newValue)) {
        setDisplayValue(newValue);
        
        if (onChange) {
          const numericValue = newValue === "" ? 0 : parseInt(newValue, 10);
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
        pattern="[0-9]*"
        ref={ref}
        {...props}
      />
    )
  }
)
InputNumber.displayName = "InputNumber"

export { InputNumber }

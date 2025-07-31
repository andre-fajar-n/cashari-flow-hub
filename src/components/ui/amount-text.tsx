import { cn } from "@/lib/utils/cn";

interface AmountTextProps {
  amount: number;
  className?: string;
  children?: React.ReactNode;
  showSign?: boolean;
  prefix?: string;
  suffix?: string;
}

export const AmountText = ({ 
  amount, 
  className = "", 
  children, 
  showSign = false,
  prefix = "",
  suffix = ""
}: AmountTextProps) => {
  const getAmountColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "";
  };

  const formatSign = (value: number) => {
    if (!showSign) return "";
    if (value > 0) return "+";
    if (value < 0) return "-";
    return "";
  };

  const displayAmount = showSign ? Math.abs(amount) : amount;

  return (
    <span className={cn(getAmountColor(amount), className)}>
      {prefix}
      {formatSign(amount)}
      {children || displayAmount.toLocaleString('id-ID')}
      {suffix}
    </span>
  );
};

export default AmountText;

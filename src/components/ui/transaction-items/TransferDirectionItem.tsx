import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { VariantClasses } from "@/components/ui/transaction-items/types";
import InfoItem from "@/components/ui/transaction-items/InfoItem";

interface TransferDirectionItemProps {
  icon: React.ReactNode;
  label: string;
  from: string;
  to: string;
  direction?: "from" | "to";
  variant?: "blue" | "green" | "purple" | "orange" | "red";
}

const TransferDirectionItem = ({ 
  icon, 
  label, 
  from, 
  to, 
  direction = "from", 
  variant = "blue" 
}: TransferDirectionItemProps) => {
  const variantClasses: VariantClasses = {
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    green: "text-green-700 bg-green-50 border-green-200",
    purple: "text-purple-700 bg-purple-50 border-purple-200",
    orange: "text-orange-700 bg-orange-50 border-orange-200",
    red: "text-red-700 bg-red-50 border-red-200"
  };

  // If from and to are the same, render as simple info item
  if (from === to) {
    return <InfoItem icon={icon} label={label} value={from} variant={variant} />;
  }

  // Swap from and to based on direction
  let sourceValue = from;
  let targetValue = to;
  if (direction === "from") {
    [sourceValue, targetValue] = [to, from];
  }

  const renderDirectionLabel = (isSource: boolean, text: string) => {
    if ((isSource && direction === "from") || (!isSource && direction === "to")) {
      return (
        <span className={`text-sm font-medium text-${variant}-700`}>
          {text}
        </span>
      );
    }

    return (
      <Badge variant="outline" className={`text-xs ${variantClasses[variant]} hover:bg-opacity-80`}>
        {text}
      </Badge>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-md border ${variantClasses[variant]}`}>
        {icon}
        <span>{label}:</span>
      </div>
      <div className="flex items-center gap-1">
        {renderDirectionLabel(true, sourceValue)}
        <ArrowRight className="w-3 h-3" />
        {renderDirectionLabel(false, targetValue)}
      </div>
    </div>
  );
};

export default TransferDirectionItem;

import { Badge } from "@/components/ui/badge";
import { VariantClasses } from "@/components/ui/transaction-items/types";

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "blue" | "green" | "purple" | "orange" | "red";
}

const InfoItem = ({ icon, label, value, variant = "blue" }: InfoItemProps) => {
  const variantClasses: VariantClasses = {
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    green: "text-green-700 bg-green-50 border-green-200",
    purple: "text-purple-700 bg-purple-50 border-purple-200",
    orange: "text-orange-700 bg-orange-50 border-orange-200",
    red: "text-red-700 bg-red-50 border-red-200"
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-md border ${variantClasses[variant]}`}>
        {icon}
        <span>{label}:</span>
      </div>
      <Badge variant="outline" className={`text-xs ${variantClasses[variant]} hover:bg-opacity-80`}>
        {value}
      </Badge>
    </div>
  );
};

export default InfoItem;

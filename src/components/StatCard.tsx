
import { cn } from "@/lib/utils";

const StatCard = ({ title, amount, icon: Icon, type, isPositive }) => {
  const getCardStyles = () => {
    switch (type) {
      case "income":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "expense":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      case "balance":
        return isPositive 
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          : "bg-gradient-to-r from-orange-500 to-amber-600 text-white";
      default:
        return "bg-white border border-gray-200 text-gray-800";
    }
  };

  return (
    <div className={cn(
      "p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
      getCardStyles()
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-2xl font-bold">{amount}</p>
        </div>
        <Icon className="h-8 w-8 opacity-80" />
      </div>
    </div>
  );
};

export default StatCard;

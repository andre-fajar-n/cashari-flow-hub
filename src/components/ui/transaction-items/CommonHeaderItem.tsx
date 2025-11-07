import AmountText from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { CommonHeaderItemProps } from "@/components/ui/transaction-items/types";
import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle } from "lucide-react";

const CommonHeaderItem = ({ movement }: CommonHeaderItemProps) => {
  return (
    <div className="flex items-start justify-between gap-4 sm:gap-3">
      <div className="flex items-start sm:items-center gap-4 sm:gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 p-3 sm:p-2 rounded-2xl sm:rounded-full bg-gradient-to-br from-gray-50 to-gray-100 sm:bg-gray-50 shadow-sm sm:shadow-none">
          {movement.amount > 0 ? (
            <ArrowUpCircle className="w-6 h-6 sm:w-5 sm:h-5 text-green-600" />
          ) : (
            movement.amount < 0 ? (
              <ArrowDownCircle className="w-6 h-6 sm:w-5 sm:h-5 text-red-600" />
            ) : (
              <ArrowLeftRight className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" />
            )
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg sm:font-semibold sm:text-base text-gray-900 truncate mb-1 sm:mb-0">
            {movement.category_name}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1 text-sm sm:text-xs text-gray-500 mt-1 sm:mt-0.5">
            <span className="truncate font-medium sm:font-normal">{movement.wallet_name}</span>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">{formatDate(movement.date)}</span>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <AmountText
          amount={movement.amount}
          className="font-bold text-xl sm:text-lg"
        >
          {formatAmountCurrency(movement.amount, movement.currency_code)}
        </AmountText>

        {/* Currency */}
        {movement.exchange_rate && movement.exchange_rate !== 1 && (
          <p className="text-sm text-gray-500 mt-1">
            {formatAmountCurrency(movement.amount * movement.exchange_rate, movement.base_currency_code)}
          </p>
        )}

        {/* Amount Unit */}
        {movement.amount_unit && (
          <p className="text-sm text-gray-500 mt-1">
            {movement.amount_unit} {movement.unit_label || 'unit'}
          </p>
        )}
      </div>
    </div>
  );
};

export default CommonHeaderItem;

import { CommonActionItem, CommonDescriptionItem, CommonHeaderItem, CommonAdditionalInfo } from "@/components/ui/transaction-items";
import { CommonItemProps } from "@/components/ui/transaction-items/types";
import { getTransactionTypeConfig } from "@/components/ui/transaction-items/utils";
import { Badge } from "@/components/ui/badge";

const CommonItem = ({ movement, hideTypeText = false, onEdit, onDelete }: CommonItemProps) => {
  const typeConfig = getTransactionTypeConfig(movement.resource_type || "");

  const IconComponent = typeConfig.icon;

  return (
    <div
      key={movement.id}
      className="bg-white border-2 sm:border border-gray-100 sm:border-gray-200 rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-sm hover:shadow-lg sm:hover:shadow-md hover:border-gray-200 transition-all duration-200 sm:duration-75"
    >
      {!hideTypeText && (
        <div className="mb-4">
          <Badge
            variant="outline"
            className={`${typeConfig.className} font-medium text-sm px-3 py-1.5 rounded-lg`}
          >
            <IconComponent className="w-4 h-4 mr-2" />
            {typeConfig.text}
          </Badge>
        </div>
      )}

      <div className="space-y-4 sm:space-y-3">
        <CommonHeaderItem movement={movement} />
        <CommonDescriptionItem movement={movement} />

        <div className="mt-4">
          <CommonAdditionalInfo movement={movement} />
        </div>

        <CommonActionItem movement={movement} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default CommonItem;

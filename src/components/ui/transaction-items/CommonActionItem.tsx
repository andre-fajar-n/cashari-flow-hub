import { Button } from "@/components/ui/button";
import { CommonActionItemProps } from "@/components/ui/transaction-items/types";
import { Edit, Trash2 } from "lucide-react";

const CommonActionItem = ({ movement, onEdit, onDelete }: CommonActionItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-2 border-t-2 sm:border-t border-gray-100">
      <Button
        variant="outline"
        size="lg"
        className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
        onClick={() => onEdit(movement)}
      >
        <Edit className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
        onClick={() => onDelete(movement.resource_id)}
      >
        <Trash2 className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
        Hapus
      </Button>
    </div>
  );
};

export default CommonActionItem;

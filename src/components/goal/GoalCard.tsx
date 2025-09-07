import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Eye, TrendingUp, Trash2, Calendar, Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoalModel } from "@/models/goals";

interface GoalCardProps {
  goal: GoalModel;
  totalAmount: number;
  onEdit: (goal: GoalModel) => void;
  onDelete: (goalId: number) => void;
}

const GoalCard = ({ goal, totalAmount, onEdit, onDelete }: GoalCardProps) => {

  const navigate = useNavigate();

  const percentage = Math.min(totalAmount / goal.target_amount * 100, 100);

  const handleViewDetail = () => {
    navigate(`/goal/${goal.id}`);
  };

  return (
    <Card className="bg-white border-2 sm:border border-gray-100 sm:border-gray-200 rounded-2xl sm:rounded-lg p-5 sm:p-3 shadow-sm hover:shadow-lg sm:hover:shadow-md hover:border-gray-200 transition-all duration-200 sm:duration-75">
      <div className="space-y-5 sm:space-y-2">
        {/* Compact Header Section */}
        <div className="flex items-start justify-between gap-4 sm:gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl sm:font-medium sm:text-sm text-gray-900 truncate mb-3 sm:mb-1">{goal.name}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
              <span className={`text-sm sm:text-xs px-4 sm:px-2 py-2 sm:py-0.5 rounded-full sm:rounded-md font-bold sm:font-medium shadow-sm sm:shadow-none w-fit ${
                goal.is_achieved
                  ? 'bg-green-100 text-green-800 border border-green-200 sm:border-transparent'
                  : goal.is_active
                  ? 'bg-blue-100 text-blue-800 border border-blue-200 sm:border-transparent'
                  : 'bg-gray-100 text-gray-800 border border-gray-200 sm:border-transparent'
              }`}>
                {goal.is_achieved ? '🎉 Tercapai' : goal.is_active ? '🎯 Aktif' : '⏸️ Tidak Aktif'}
              </span>
              {goal.target_date && (
                <div className="flex items-center gap-2 text-sm sm:text-xs text-gray-600 bg-gray-50 sm:bg-transparent px-3 sm:px-0 py-2 sm:py-0 rounded-xl sm:rounded-none border border-gray-200 sm:border-transparent">
                  <Calendar className="w-4 h-4 sm:w-3 sm:h-3" />
                  <span className="font-medium sm:font-normal">Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          {/* Target amount in header for compact view */}
          <div className="hidden sm:block text-right">
            <div className="text-xs text-gray-500">Target</div>
            <div className="font-semibold text-sm text-blue-600">
              {goal.target_amount.toLocaleString('id-ID')} {goal.currency_code}
            </div>
          </div>
        </div>

        {/* Compact Progress Section */}
        <div className="bg-gradient-to-r from-gray-50 to-green-50 sm:bg-gray-50 rounded-2xl sm:rounded-md p-4 sm:p-2 border border-gray-200 sm:border-transparent">
          <div className="space-y-4 sm:space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-1">
                <div className="p-2 sm:hidden bg-green-100 rounded-xl shadow-sm">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-base sm:text-xs font-bold sm:font-medium text-gray-700">Progress</span>
              </div>
              <div className="bg-white sm:bg-transparent px-4 sm:px-0 py-2 sm:py-0 rounded-xl sm:rounded-none border border-green-200 sm:border-transparent shadow-sm sm:shadow-none">
                <span className="text-lg sm:text-xs font-bold sm:font-semibold text-green-600">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-1">
              <Progress value={percentage} className="h-4 sm:h-1.5 bg-gray-200" />
              {/* Mobile: Show amounts in grid, Desktop: Show only collected amount */}
              <div className="grid grid-cols-2 gap-4 sm:hidden">
                <div className="text-center bg-white rounded-xl p-3 border border-green-200 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Terkumpul</div>
                  <div className="font-bold text-green-600 text-sm">
                    {totalAmount.toLocaleString('id-ID')} {goal.currency_code}
                  </div>
                </div>
                <div className="text-center bg-white rounded-xl p-3 border border-blue-200 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Target</div>
                  <div className="font-bold text-blue-600 text-sm">
                    {goal.target_amount.toLocaleString('id-ID')} {goal.currency_code}
                  </div>
                </div>
              </div>
              {/* Desktop: Compact collected amount only */}
              <div className="hidden sm:block text-center">
                <div className="text-xs text-gray-500">Terkumpul</div>
                <div className="font-semibold text-green-600 text-sm">
                  {totalAmount.toLocaleString('id-ID')} {goal.currency_code}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-1 pt-4 sm:pt-1 border-t-2 sm:border-t border-gray-100">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-7 rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-xs font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={handleViewDetail}
          >
            <Eye className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-7 rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-xs font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => onEdit(goal)}
          >
            <Edit className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-7 rounded-xl sm:rounded-md text-base sm:text-xs font-medium sm:font-normal hover:bg-red-600 transition-all"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GoalCard;

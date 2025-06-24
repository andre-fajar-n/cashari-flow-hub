
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Edit, Trash2, TrendingUp, BarChart3, Plus, Minus, ArrowRightLeft } from "lucide-react";
import { GoalProgressData } from "./GoalProgressCalculator";
import { GoalTransferConfig } from "./GoalTransferModes";

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  currency_code: string;
  target_date: string;
  is_achieved: boolean;
  is_active: boolean;
  created_at: string;
}

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgressData;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onAddRecord: (goalId: number) => void;
  onTransferToGoal?: (config: GoalTransferConfig) => void;
}

const GoalCard = ({ goal, progress, onEdit, onDelete, onAddRecord, onTransferToGoal }: GoalCardProps) => {
  const handleAddToGoal = () => {
    onTransferToGoal?.({
      mode: 'add_to_goal',
      goalId: goal.id,
      goalName: goal.name,
    });
  };

  const handleTakeFromGoal = () => {
    onTransferToGoal?.({
      mode: 'take_from_goal',
      goalId: goal.id,
      goalName: goal.name,
    });
  };

  const handleTransferBetweenGoals = () => {
    onTransferToGoal?.({
      mode: 'transfer_between_goals',
      goalId: goal.id,
      goalName: goal.name,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1">
            <h3 className="font-semibold">{goal.name}</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm font-medium text-blue-600">
                Target: {goal.target_amount.toLocaleString()} {goal.currency_code}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                goal.is_achieved 
                  ? 'bg-green-100 text-green-800' 
                  : goal.is_active
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {goal.is_achieved ? 'Tercapai' : goal.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
            {goal.target_date && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Target tanggal: {new Date(goal.target_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddRecord(goal.id)}
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Record
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(goal)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Hapus
            </Button>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <span className="text-sm text-gray-600">
              {progress.totalAmount.toLocaleString()} / {goal.target_amount.toLocaleString()} {goal.currency_code}
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>
              Transfer: {progress.transferAmount.toLocaleString()} | 
              Records: {progress.recordAmount.toLocaleString()}
            </div>
            <span>
              {progress.percentage.toFixed(1)}% tercapai
            </span>
          </div>
        </div>

        {/* Transfer Buttons */}
        {goal.is_active && !goal.is_achieved && onTransferToGoal && (
          <div className="border-t pt-3">
            <div className="text-xs text-gray-500 mb-2">Transfer Goal</div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddToGoal}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Tambah
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTakeFromGoal}
                className="text-xs"
              >
                <Minus className="w-3 h-3 mr-1" />
                Ambil
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTransferBetweenGoals}
                className="text-xs"
              >
                <ArrowRightLeft className="w-3 h-3 mr-1" />
                Pindah
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GoalCard;

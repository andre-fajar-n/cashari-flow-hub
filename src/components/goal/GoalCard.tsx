
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Edit, Trash2, TrendingUp, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoalProgressData } from "./GoalProgressCalculator";

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
}

const GoalCard = ({ goal, progress, onEdit, onDelete }: GoalCardProps) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/goal/${goal.id}`);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            <div className="flex items-center gap-3 mt-1">
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
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Target: {new Date(goal.target_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewDetail}
            >
              <Eye className="w-3 h-3 mr-1" />
              Detail
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
        
        {/* Progress Section - Compact */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <span className="text-sm text-gray-600">
              {progress.totalAmount.toLocaleString()} ({progress.percentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      </div>
    </Card>
  );
};

export default GoalCard;

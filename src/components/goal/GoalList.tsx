
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GoalCard from "@/components/goal/GoalCard";
import { GoalProgressData } from "@/components/goal/GoalProgressCalculator";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";

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

interface GoalListProps {
  isLoading: boolean;
  goals: Goal[];
  calculateProgress: (goalId: number, targetAmount: number) => GoalProgressData;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onAddRecord: (goalId: number) => void;
  onAddNew: () => void;
  onTransferToGoal?: (config: GoalTransferConfig) => void;
}

const GoalList = ({ 
  isLoading,
  goals, 
  calculateProgress, 
  onEdit, 
  onDelete, 
  onAddRecord, 
  onAddNew,
  onTransferToGoal 
}: GoalListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Memuat target...</p>
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Belum ada target yang dibuat</p>
        <Button onClick={onAddNew} className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Buat Target Pertama
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {goals.map((goal) => {
        const progress = calculateProgress(goal.id, goal.target_amount);
        
        return (
          <GoalCard
            key={goal.id}
            goal={goal}
            progress={progress}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddRecord={onAddRecord}
            onTransferToGoal={onTransferToGoal}
          />
        );
      })}
    </div>
  );
};

export default GoalList;

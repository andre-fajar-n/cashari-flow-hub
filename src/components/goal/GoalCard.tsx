import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRightLeft, BarChart3, Eye, Minus, Plus, Settings2, TrendingUp, Trash2, Calendar, Edit,
} from "lucide-react";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { GoalModel } from "@/models/goals";

interface GoalCardProps {
  goal: GoalModel;
  totalAmount: number;
  onEdit: (goal: GoalModel) => void;
  onDelete: (goalId: number) => void;
  onAddRecord: (goalId: number) => void;
  onTransferToGoal?: (config: GoalTransferConfig) => void;
}

const GoalCard = ({ goal, totalAmount, onEdit, onDelete, onAddRecord, onTransferToGoal }: GoalCardProps) => {
  const [settingsDropdownOpenId, setSettingsDropdownOpenId] = useState<number | null>(null);
  const [optionsDropdownOpenId, setOptionsDropdownOpenId] = useState<number | null>(null);
  const navigate = useNavigate();

  const percentage = Math.min(totalAmount / goal.target_amount * 100, 100);

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

  const handleViewDetail = () => {
    navigate(`/goal/${goal.id}`);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1">
            <h3 className="font-semibold">{goal.name}</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm font-medium text-blue-600">
                Target: {goal.target_amount.toLocaleString('id-ID')} {goal.currency_code}
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
          {goal.is_active && !goal.is_achieved && onTransferToGoal && (
            <ActionDropdown
              dropdownId={goal.id}
              openDropdownId={optionsDropdownOpenId}
              setOpenDropdownId={(id) => {
                setOptionsDropdownOpenId(id);
                if (id !== null) setSettingsDropdownOpenId(null); // optional close other
              }}
              triggerContent={
                <Button variant="ghost" size="sm">
                  <Settings2 className="w-4 h-4 mr-2" />
                </Button>
              }
              menuItems={[
                {
                  label: "Tambah",
                  icon: <Plus className="w-3 h-3 mr-1" />,
                  onClick: handleAddToGoal,
                },
                {
                  label: "Ambil",
                  icon: <Minus className="w-3 h-3 mr-1" />,
                  onClick: handleTakeFromGoal,
                },
                {
                  label: "Pindah",
                  icon: <ArrowRightLeft className="w-3 h-3 mr-1" />,
                  onClick: handleTransferBetweenGoals,
                },
                {
                  label: "Update Progress",
                  icon: <BarChart3 className="w-3 h-3 mr-1" />,
                  onClick: () => onAddRecord(goal.id),
                },
              ]}
            />
          )}
          <ActionDropdown
            dropdownId={goal.id}
            openDropdownId={settingsDropdownOpenId}
            setOpenDropdownId={(id) => {
              setSettingsDropdownOpenId(id);
              if (id !== null) setOptionsDropdownOpenId(null); // optional close other
            }}
            triggerContent={
              <Button variant="ghost" size="sm">
                •••
              </Button>
            }
            menuItems={[
              {
                label: "Detail",
                icon: <Eye className="w-3 h-3" />,
                onClick: handleViewDetail,
              },
              {
                label: "Edit",
                icon: <Edit className="w-3 h-3" />,
                onClick: () => onEdit(goal),
              },
              {
                label: "Hapus",
                icon: <Trash2 className="w-3 h-3" />,
                onClick: () => onDelete(goal.id),
                className: "text-red-600",
              },
            ]}
          />
        </div>
        
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <span className="text-sm text-gray-600">
              {totalAmount.toLocaleString('id-ID')} / {goal.target_amount.toLocaleString('id-ID')} {goal.currency_code} ({percentage.toFixed(1)}% tercapai)
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </div>
    </Card>
  );
};

export default GoalCard;

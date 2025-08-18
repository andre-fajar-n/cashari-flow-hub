import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface GoalHeaderProps {
  onAddNew: () => void;
  goals: any[];
}

const GoalHeader = ({ onAddNew, goals }: GoalHeaderProps) => {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <CardTitle>Target & Goals</CardTitle>
        <p className="text-gray-600">Kelola target keuangan Anda</p>
      </div>
      {goals && goals.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Target
          </Button>
        </div>
      )}
    </CardHeader>
  );
};

export default GoalHeader;

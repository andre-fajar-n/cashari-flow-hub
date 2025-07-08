import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalHeader from "@/components/goal/GoalHeader";
import GoalList from "@/components/goal/GoalList";
import { useGoalTransfers, useGoalInvestmentRecords, useGoals, useDeleteGoal } from "@/hooks/queries";
import { calculateGoalProgress } from "@/components/goal/GoalProgressCalculator";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalModel } from "@/models/goals";

const Goal = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalModel | undefined>(undefined);
  const [selectedGoalForRecord, setSelectedGoalForRecord] = useState<number | undefined>(undefined);
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  const { mutate: deleteGoal } = useDeleteGoal();

  const { data: goals, isLoading } = useGoals();
  const { data: goalTransfers } = useGoalTransfers();
  const { data: goalRecords } = useGoalInvestmentRecords();

  const handleGoalProgressCalculation = (goalId: number, targetAmount: number) => {
    return calculateGoalProgress(goalId, targetAmount, goalTransfers, goalRecords);
  };

  const handleEdit = (goal: GoalModel) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (goalId: number) => {
    setGoalToDelete(goalId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleAddRecord = (goalId: number) => {
    setSelectedGoalForRecord(goalId);
    setIsRecordDialogOpen(true);
  };

  const handleTransferToGoal = (config: GoalTransferConfig) => {
    setTransferConfig(config);
    setIsTransferDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Goal"
          description="Apakah Anda yakin ingin menghapus goal ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />
        
        <Card className="mb-6">
          <GoalHeader 
            onAddNew={handleAddNew}
            goals={goals || []}
          />
          <CardContent>
            <GoalList
              isLoading={isLoading}
              goals={goals || []}
              calculateProgress={handleGoalProgressCalculation}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onAddRecord={handleAddRecord}
              onAddNew={handleAddNew}
              onTransferToGoal={handleTransferToGoal}
            />
          </CardContent>
        </Card>

        <GoalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          goal={selectedGoal}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }}
        />

        <GoalTransferDialog
          open={isTransferDialogOpen}
          onOpenChange={(open) => {
            setIsTransferDialogOpen(open);
            if (!open) {
              setTransferConfig(undefined);
            }
          }}
          transferConfig={transferConfig}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }}
        />

        <GoalInvestmentRecordDialog
          open={isRecordDialogOpen}
          onOpenChange={setIsRecordDialogOpen}
          goalId={selectedGoalForRecord}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Goal;

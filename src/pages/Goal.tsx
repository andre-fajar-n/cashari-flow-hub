import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { useGoalTransfers, useGoalInvestmentRecords, useGoals, useDeleteGoal, useCurrencies } from "@/hooks/queries";
import { calculateGoalProgress } from "@/components/goal/GoalProgressCalculator";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalModel } from "@/models/goals";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import GoalCard from "@/components/goal/GoalCard";

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
  const { data: currencies } = useCurrencies();

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

  const renderGoalItem = (goal: GoalModel) => {
    const progress = handleGoalProgressCalculation(goal.id, goal.target_amount);
    
    return (
      <GoalCard
        key={goal.id}
        goal={goal}
        progress={progress}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAddRecord={handleAddRecord}
        onTransferToGoal={handleTransferToGoal}
      />
    );
  };

  const columnFilters: ColumnFilter[] = [
    {
      field: "is_achieved",
      label: "Status Pencapaian",
      type: "select",
      options: [
        { label: "Tercapai", value: "true" },
        { label: "Belum Tercapai", value: "false" }
      ]
    },
    {
      field: "is_active",
      label: "Status Aktif",
      type: "select",
      options: [
        { label: "Aktif", value: "true" },
        { label: "Tidak Aktif", value: "false" }
      ]
    },
    {
      field: "currency_code",
      label: "Mata Uang",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "target_amount",
      label: "Target Min",
      type: "number"
    },
    {
      field: "target_date",
      label: "Tanggal Target",
      type: "date"
    }
  ];

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
        
        <DataTable
          data={goals || []}
          isLoading={isLoading}
          searchPlaceholder="Cari target..."
          searchFields={["name", "currency_code"]}
          columnFilters={columnFilters}
          renderItem={renderGoalItem}
          emptyStateMessage="Belum ada target yang dibuat"
          title="Manajemen Target"
          description="Kelola target keuangan Anda"
          headerActions={
            goals && goals.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Target
              </Button>
            )
          }
        />

        {(!goals || goals.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Buat Target Pertama
            </Button>
          </div>
        )}

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
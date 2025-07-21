
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalMovementsHistory from "@/components/goal/GoalMovementsHistory";
import GoalFundsSummary from "@/components/goal/GoalFundsSummary";
import { useGoalTransfers, useGoalInvestmentRecords, useGoals, useDeleteGoal } from "@/hooks/queries";
import { calculateGoalProgress } from "@/components/goal/GoalProgressCalculator";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Progress } from "@/components/ui/progress";
import { GoalModel } from "@/models/goals";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import { formatAmountCurrency } from "@/lib/utils";
import AmountText from "@/components/ui/amount-text";

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  const { mutate: deleteGoal } = useDeleteGoal();
  const { data: goals } = useGoals();
  const { data: goalTransfers } = useGoalTransfers();
  const { data: goalRecords } = useGoalInvestmentRecords();
  const { data: goalMovements } = useMoneyMovements({ goalId: parseInt(id!) });

  const goal = goals?.find(g => g.id === parseInt(id!)) as GoalModel;

  if (!goal) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Goal tidak ditemukan</p>
            <Button onClick={() => navigate('/goal')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Goal
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const progress = calculateGoalProgress(goal.id, goal.target_amount, goalTransfers, goalRecords);

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteGoal(goal.id, {
      onSuccess: () => {
        navigate('/goal');
      }
    });
  };

  const handleAddRecord = () => {
    setIsRecordDialogOpen(true);
  };

  const handleAddToGoal = () => {
    setTransferConfig({
      mode: 'add_to_goal',
      goalId: goal.id,
      goalName: goal.name,
    });
    setIsTransferDialogOpen(true);
  };

  const handleTakeFromGoal = () => {
    setTransferConfig({
      mode: 'take_from_goal',
      goalId: goal.id,
      goalName: goal.name,
    });
    setIsTransferDialogOpen(true);
  };

  const handleTransferBetweenGoals = () => {
    setTransferConfig({
      mode: 'transfer_between_goals',
      goalId: goal.id,
      goalName: goal.name,
    });
    setIsTransferDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/goal')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{goal.name}</h1>
                <p className="text-muted-foreground">Detail Target Keuangan</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDeleteClick}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>

          {/* Goal Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ringkasan Goal</span>
                <Badge variant={goal.is_achieved ? "default" : goal.is_active ? "secondary" : "outline"}>
                  {goal.is_achieved ? 'Tercapai' : goal.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Target Amount</p>
                  <p className="text-xl font-semibold">{goal.target_amount.toLocaleString()} {goal.currency_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress Amount</p>
                  <AmountText amount={progress.totalAmount} showSign={true} className="text-xl font-semibold">
                    {formatAmountCurrency(Math.abs(progress.totalAmount), goal.currency_code)}
                  </AmountText>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Date</p>
                  <p className="text-xl font-semibold">
                    {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Tidak ada'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Transfer: {progress.transferAmount.toLocaleString()}</span>
                  <span>Records: {progress.recordAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {goal.is_active && !goal.is_achieved && (
            <Card>
              <CardHeader>
                <CardTitle>Kelola Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button onClick={handleAddToGoal} className="flex-col h-16">
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs">Tambah Dana</span>
                  </Button>
                  <Button onClick={handleTakeFromGoal} variant="outline" className="flex-col h-16">
                    <Minus className="w-5 h-5 mb-1" />
                    <span className="text-xs">Ambil Dana</span>
                  </Button>
                  <Button onClick={handleTransferBetweenGoals} variant="outline" className="flex-col h-16">
                    <ArrowRightLeft className="w-5 h-5 mb-1" />
                    <span className="text-xs">Transfer Goal</span>
                  </Button>
                  <Button onClick={handleAddRecord} variant="outline" className="flex-col h-16">
                    <BarChart3 className="w-5 h-5 mb-1" />
                    <span className="text-xs">Update Progress</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Funds Summary */}
          <GoalFundsSummary goalId={goal.id} />

          {/* Movement History */}
          <GoalMovementsHistory movements={goalMovements || []} />

          {/* Modals */}
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

          <GoalDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            goal={goal}
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
              queryClient.invalidateQueries({ queryKey: ["goal_movements"] });
              queryClient.invalidateQueries({ queryKey: ["goals"] });
            }}
          />

          <GoalInvestmentRecordDialog
            open={isRecordDialogOpen}
            onOpenChange={setIsRecordDialogOpen}
            goalId={goal.id}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
              queryClient.invalidateQueries({ queryKey: ["goal_movements"] });
              queryClient.invalidateQueries({ queryKey: ["goals"] });
            }}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default GoalDetail;

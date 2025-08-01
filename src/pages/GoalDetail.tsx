import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3, Calculator } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalFundsSummary from "@/components/goal/GoalFundsSummary";
import GoalOverview from "@/components/goal/GoalOverview";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalModel } from "@/models/goals";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import { formatAmountCurrency } from "@/lib/currency";
import AmountText from "@/components/ui/amount-text";
import { calculateGoalProgress } from "@/components/goal/GoalProgressCalculator";
import MovementsDataTable from "@/components/shared/MovementsDataTable";
import { useDeleteGoal, useGoals } from "@/hooks/queries/use-goals";
import { useGoalTransfers } from "@/hooks/queries/use-goal-transfers";
import { useGoalInvestmentRecords } from "@/hooks/queries/use-goal-investment-records";

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  const { mutate: deleteGoal } = useDeleteGoal();
  const { data: goals, isLoading } = useGoals();
  const { data: goalTransfers, isLoading: isTransfersLoading } = useGoalTransfers();
  const { data: goalRecords, isLoading: isRecordsLoading } = useGoalInvestmentRecords();
  const { data: goalMovements, isLoading: isMovementsLoading } = useMoneyMovements({ goalId: parseInt(id!) });

  const goal = goals?.find(g => g.id === parseInt(id!)) as GoalModel;

  // Check loading states and goal existence before accessing goal properties
  if (!goal || isLoading || isTransfersLoading || isRecordsLoading || isMovementsLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat data...</p>
            <Button onClick={() => navigate('/goal')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Goal
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Calculate progress after ensuring goal exists
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

          {/* Action Buttons */}
          {goal.is_active && !goal.is_achieved && (
            <div className="flex gap-2">
              <Button onClick={handleAddToGoal} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Dana
              </Button>
              <Button onClick={handleTakeFromGoal} variant="outline" size="sm">
                <Minus className="w-4 h-4 mr-1" />
                Ambil Dana
              </Button>
              <Button onClick={handleTransferBetweenGoals} variant="outline" size="sm">
                <ArrowRightLeft className="w-4 h-4 mr-1" />
                Transfer Goal
              </Button>
              <Button onClick={handleAddRecord} variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                Update Progress
              </Button>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <GoalOverview 
                goal={goal} 
                goalTransfers={goalTransfers || []} 
                goalRecords={goalRecords || []} 
              />
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4">
              {/* Total Amount Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Total Dana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <AmountText
                      amount={progress.totalAmount}
                      className="text-3xl font-bold"
                      showSign={true}
                    >
                      {formatAmountCurrency(progress.totalAmount, goal.currency_code)}
                    </AmountText>
                    <p className="text-sm text-muted-foreground mt-2">
                      Total dana dalam goal ini
                    </p>
                  </div>
                </CardContent>
              </Card>

              <GoalFundsSummary goalId={goal.id} />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <MovementsDataTable
                movements={goalMovements || []}
                transfers={goalTransfers || []}
                filterType="goal"
                filterId={goal.id}
                title="Riwayat Pergerakan Dana"
                description="Kelola dan pantau semua pergerakan dana dalam goal ini"
                emptyMessage="Belum ada riwayat pergerakan dana"
              />
            </TabsContent>
          </Tabs>

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
          />

          <GoalInvestmentRecordDialog
            open={isRecordDialogOpen}
            onOpenChange={setIsRecordDialogOpen}
            goalId={goal.id}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default GoalDetail;

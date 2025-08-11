import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalOverview from "@/components/goal/GoalOverview";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import MovementsDataTable from "@/components/shared/MovementsDataTable";
import { useDeleteGoal, useGoalDetail } from "@/hooks/queries/use-goals";
import { useGoalTransfers } from "@/hooks/queries/use-goal-transfers";
import { useGoalFundsSummary } from "@/hooks/queries/use-goal-funds-summary";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useInvestmentAssets } from "@/hooks/queries/use-investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useGoalInvestmentRecords } from "@/hooks/queries";

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  const { mutate: deleteGoal } = useDeleteGoal();
  const { data: goal, isLoading: isGoalLoading } = useGoalDetail(parseInt(id!));
  const { data: goalTransfers, isLoading: isTransfersLoading } = useGoalTransfers();
  const { data: goalMovements, isLoading: isMovementsLoading } = useMoneyMovements({ goalId: parseInt(id!) });
  const { data: goalFundsSummary, isLoading: isFundsSummaryLoading } = useGoalFundsSummary(parseInt(id!));
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: assets, isLoading: isAssetsLoading } = useInvestmentAssets();
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const { data: goalRecords, isLoading: isRecordsLoading } = useGoalInvestmentRecords();

  const isLoading = isGoalLoading || isTransfersLoading || isMovementsLoading || isFundsSummaryLoading || isWalletsLoading ||
                    isAssetsLoading || isInstrumentsLoading || isRecordsLoading;

  // Check loading states and goal existence before accessing goal properties
  if (!goal || isLoading) {
    const message = !goal ? "Data tidak ditemukan" : "Memuat data..."
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => navigate('/goal')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Goal
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const totalAmount = goalFundsSummary?.reduce((sum, fund) => sum + fund.total_amount, 0) || 0;
  const percentage = Math.min(totalAmount / goal.target_amount * 100, 100);

  let totalAmountRecord = 0;
  let totalAmountTransfer = 0;

  for (const movement of goalMovements || []) {
    if (movement.resource_type === "investment_growth") {
      totalAmountRecord += movement.amount;
    } else if (
      movement.resource_type === "goal_transfers_in" ||
      movement.resource_type === "goal_transfers_out"
    ) {
      totalAmountTransfer += movement.amount;
    }
  }


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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <GoalOverview
                goal={goal}
                totalAmount={totalAmount}
                percentage={percentage}
                totalAmountRecord={totalAmountRecord}
                totalAmountTransfer={totalAmountTransfer}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <MovementsDataTable
                movements={goalMovements || []}
                transfers={goalTransfers || []}
                records={goalRecords || []}
                wallets={wallets || []}
                instruments={instruments || []}
                assets={assets || []}
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


import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3, Calculator } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalMovementsHistory from "@/components/goal/GoalMovementsHistory";
import GoalFundsSummary from "@/components/goal/GoalFundsSummary";
import GoalOverview from "@/components/goal/GoalOverview";
import { useGoalTransfers, useGoalInvestmentRecords, useGoals, useDeleteGoal } from "@/hooks/queries";
import { useGoalFundsSummary } from "@/hooks/queries/use-goal-funds-summary";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
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
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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
                  {(() => {
                    const { data: fundsSummary } = useGoalFundsSummary(goal.id);
                    if (!fundsSummary) return <p className="text-muted-foreground">Memuat total dana...</p>;

                    const totalAmount = fundsSummary.reduce((sum, fund) => sum + fund.total_amount, 0);
                    const currencyCode = fundsSummary[0]?.currency_code || goal.currency_code;

                    return (
                      <div className="text-center py-4">
                        <AmountText
                          amount={totalAmount}
                          className="text-3xl font-bold"
                          showSign={true}
                        >
                          {formatAmountCurrency(totalAmount, currencyCode)}
                        </AmountText>
                        <p className="text-sm text-muted-foreground mt-2">
                          Total dana dalam goal ini
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <GoalFundsSummary goalId={goal.id} />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <GoalMovementsHistory 
                movements={goalMovements || []} 
                transfers={goalTransfers || []} 
                goalId={goal.id}
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

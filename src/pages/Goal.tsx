
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalHeader from "@/components/goal/GoalHeader";
import GoalList from "@/components/goal/GoalList";
import { useToast } from "@/hooks/use-toast";
import { useGoalTransfers, useGoalInvestmentRecords } from "@/hooks/queries";
import { calculateGoalProgress } from "@/components/goal/GoalProgressCalculator";
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

const Goal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [selectedGoalForRecord, setSelectedGoalForRecord] = useState<number | undefined>(undefined);
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const { data: goalTransfers } = useGoalTransfers();
  const { data: goalRecords } = useGoalInvestmentRecords();

  const handleGoalProgressCalculation = (goalId: number, targetAmount: number) => {
    return calculateGoalProgress(goalId, targetAmount, goalTransfers, goalRecords);
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = async (goal: Goal) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus target "${goal.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goal.id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast({ title: "Target berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menghapus target",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleAddRecord = (goalId: number) => {
    console.log("Opening record dialog for goal:", goalId);
    setSelectedGoalForRecord(goalId);
    setIsRecordDialogOpen(true);
  };

  const handleTransferToGoal = (config: GoalTransferConfig) => {
    console.log("Opening transfer dialog with config:", config);
    setTransferConfig(config);
    setIsTransferDialogOpen(true);
  };

  const handleGeneralTransfer = () => {
    setTransferConfig(undefined);
    setIsTransferDialogOpen(true);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-4">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Card className="mb-6">
          <GoalHeader 
            onAddNew={handleAddNew}
            onTransfer={handleGeneralTransfer}
          />
          <CardContent>
            <GoalList
              goals={goals || []}
              calculateProgress={handleGoalProgressCalculation}
              onEdit={handleEdit}
              onDelete={handleDelete}
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


import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2, TrendingUp, ArrowUpCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import { useToast } from "@/hooks/use-toast";
import { useGoalTransfers } from "@/hooks/queries/useGoalTransfers";
import { Progress } from "@/components/ui/progress";

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
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);

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

  const calculateGoalProgress = (goalId: number, targetAmount: number) => {
    const transfers = goalTransfers?.filter(t => t.to_goal_id === goalId) || [];
    const totalAmount = transfers.reduce((sum, transfer) => sum + transfer.amount_to, 0);
    const percentage = Math.min((totalAmount / targetAmount) * 100, 100);
    return { totalAmount, percentage };
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
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Target & Goals</CardTitle>
              <p className="text-gray-600">Kelola target keuangan Anda</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsTransferDialogOpen(true)} variant="outline">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Transfer ke Goal
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Target
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {goals && goals.length > 0 ? (
              <div className="grid gap-4">
                {goals.map((goal) => {
                  const { totalAmount, percentage } = calculateGoalProgress(goal.id, goal.target_amount);
                  
                  return (
                    <Card key={goal.id} className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">{goal.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm font-medium text-blue-600">
                                Target: {goal.target_amount.toLocaleString()} {goal.currency_code}
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
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(goal)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(goal)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Section */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">Progress</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {totalAmount.toLocaleString()} / {goal.target_amount.toLocaleString()} {goal.currency_code}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-right">
                            <span className="text-xs text-gray-500">
                              {percentage.toFixed(1)}% tercapai
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada target yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Target Pertama
                </Button>
              </div>
            )}
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
          onOpenChange={setIsTransferDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Goal;


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Calendar } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

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
  const [isAdding, setIsAdding] = useState(false);

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

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Navbar />
          
          <Card className="mb-6">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Target Keuangan</CardTitle>
                <p className="text-gray-600">Kelola target dan tujuan keuangan Anda</p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Target
              </Button>
            </CardHeader>
            <CardContent>
              {goals && goals.length > 0 ? (
                <div className="grid gap-4">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-600" />
                              <h3 className="font-semibold">{goal.name}</h3>
                              {goal.is_achieved && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Tercapai
                                </span>
                              )}
                              {!goal.is_active && (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  Tidak Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Target: {goal.currency_code} {goal.target_amount.toLocaleString()}
                            </p>
                            {goal.target_date && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                Target tanggal: {new Date(goal.target_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Progress</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Hapus</Button>
                          </div>
                        </div>
                        
                        {/* Progress bar placeholder */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progress: {goal.currency_code} 0</span>
                            <span>0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada target keuangan yang dibuat</p>
                  <Button onClick={() => setIsAdding(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Target Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Goal;

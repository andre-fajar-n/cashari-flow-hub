
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

interface Budget {
  id: number;
  name: string;
  amount: number;
  currency_code: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const Budget = () => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Budget[];
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
                <CardTitle>Manajemen Budget</CardTitle>
                <p className="text-gray-600">Kelola anggaran keuangan Anda</p>
              </div>
              {budgets.length > 0 && (
                <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Budget
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {budgets && budgets.length > 0 ? (
                <div className="grid gap-4">
                  {budgets.map((budget) => (
                    <Card key={budget.id} className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className="font-semibold">{budget.name}</h3>
                          <p className="text-sm text-gray-600">
                            {budget.currency_code} {budget.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Hapus</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada budget yang dibuat</p>
                  <Button onClick={() => setIsAdding(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Budget Pertama
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

export default Budget;


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

interface Debt {
  id: number;
  name: string;
  type: string;
  currency_code: string;
  due_date: string;
  created_at: string;
}

const Debt = () => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Debt[];
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
                <CardTitle>Manajemen Hutang</CardTitle>
                <p className="text-gray-600">Kelola hutang dan piutang Anda</p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Hutang
              </Button>
            </CardHeader>
            <CardContent>
              {debts && debts.length > 0 ? (
                <div className="grid gap-4">
                  {debts.map((debt) => (
                    <Card key={debt.id} className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{debt.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              debt.type === 'debt' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {debt.type === 'debt' ? 'Hutang' : 'Piutang'}
                            </span>
                            <span className="text-sm text-gray-600">{debt.currency_code}</span>
                          </div>
                          {debt.due_date && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              Jatuh tempo: {new Date(debt.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">History</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Hapus</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada data hutang/piutang</p>
                  <Button onClick={() => setIsAdding(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data Pertama
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

export default Debt;

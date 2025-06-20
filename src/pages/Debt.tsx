
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import DebtDialog from "@/components/debt/DebtDialog";
import { useToast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';

interface Debt {
  id: number;
  name: string;
  type: Database["public"]["Enums"]["debt_type"];
  currency_code: string;
  due_date: string;
  created_at: string;
}

const Debt = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>(undefined);

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

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDialogOpen(true);
  };

  const handleDelete = async (debt: Debt) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${debt.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", debt.id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast({ title: "Data berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menghapus data",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedDebt(undefined);
    setIsDialogOpen(true);
  };

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
              {debts && debts.length > 0 && (
                <Button onClick={handleAddNew} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Hutang
                </Button>
              )}
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
                              debt.type === 'loan' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {debt.type === 'loan' ? 'Hutang' : 'Piutang'}
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(debt)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(debt)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada data hutang/piutang</p>
                  <Button onClick={handleAddNew} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DebtDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        debt={selectedDebt}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["debts"] });
        }}
      />
    </ProtectedRoute>
  );
};

export default Debt;

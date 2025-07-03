
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import DebtDialog from "@/components/debt/DebtDialog";
import { DEBT_TYPES } from "@/constants/enums";
import ConfirmationModal from "@/components/ConfirmationModal";
import { DebtModel, useDebts, useDeleteDebt } from "@/hooks/queries";

const Debt = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<DebtModel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtModel | undefined>(undefined);

  const { mutate: deleteDebt } = useDeleteDebt();
  
  const { data: debts, isLoading } = useDebts();

  const handleEdit = (debt: DebtModel) => {
    setSelectedDebt(debt);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (debt: DebtModel) => {
    setDebtToDelete(debt);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (debtToDelete) {
      deleteDebt(debtToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedDebt(undefined);
    setIsDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Hutang/Piutang"
          description="Apakah Anda yakin ingin menghapus hutang/piutang ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />
        
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
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat data hutang/piutang...</p>
              </div>
            ) : !debts || debts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada data hutang/piutang</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Data Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {debts.map((debt) => (
                  <Card key={debt.id} className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{debt.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            debt.type === DEBT_TYPES.LOAN 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {debt.type === DEBT_TYPES.LOAN ? 'Hutang' : 'Piutang'}
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
                          onClick={() => handleDeleteClick(debt)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DebtDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          debt={selectedDebt}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["debts"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Debt;

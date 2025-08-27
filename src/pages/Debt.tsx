import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2, History } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import DebtDialog from "@/components/debt/DebtDialog";
import { DEBT_TYPES } from "@/constants/enums";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDebts, useDeleteDebt } from "@/hooks/queries/use-debts";
import { useDebtsPaginated } from "@/hooks/queries/paginated/use-debts-paginated";
import { DebtModel } from "@/models/debts";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrencies } from "@/hooks/queries/use-currencies";

const Debt = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<DebtModel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtModel | undefined>(undefined);

  const { mutate: deleteDebt } = useDeleteDebt();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useDebtsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const debts = paged?.data || [];
  const { data: currencies } = useCurrencies();

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
      deleteDebt(debtToDelete.id);
    }
  };

  const handleAddNew = () => {
    setSelectedDebt(undefined);
    setIsDialogOpen(true);
  };

  const handleViewHistory = (debt: DebtModel) => {
    navigate(`/debt/${debt.id}/history`);
  };

  const renderDebtItem = (debt: DebtModel) => (
    <Card key={debt.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{debt.name}</h3>
            <Badge variant={debt.status === 'active' ? 'default' : 'secondary'}>
              {debt.status === 'active' ? 'Aktif' : 'Lunas'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${
              debt.type === DEBT_TYPES.LOAN 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {debt.type === DEBT_TYPES.LOAN ? 'Hutang' : 'Piutang'}
            </span>
            <span className="text-sm text-muted-foreground">{debt.currency_code}</span>
          </div>
          {debt.due_date && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Jatuh tempo: {new Date(debt.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewHistory(debt)}
          >
            <History className="w-3 h-3 mr-1" />
            Detail
          </Button>
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
  );

  const columnFilters: ColumnFilter[] = [
    {
      field: "type",
      label: "Tipe",
      type: "select",
      options: [
        { label: "Hutang", value: DEBT_TYPES.LOAN },
        { label: "Piutang", value: DEBT_TYPES.BORROWED }
      ]
    },
    {
      field: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Lunas", value: "paid_off" }
      ]
    },
    {
      field: "currency_code",
      label: "Mata Uang",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "due_date",
      label: "Tanggal Jatuh Tempo",
      type: "date"
    }
  ];

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
        
        <DataTable
          data={debts}
          isLoading={isLoading}
          searchPlaceholder="Cari hutang/piutang..."
          searchFields={["name", "currency_code"]}
          columnFilters={columnFilters}
          itemsPerPage={itemsPerPage}
          serverMode
          totalCount={paged?.count}
          page={page}
          onServerParamsChange={({ searchTerm, filters, page: nextPage }) => {
            setServerSearch(searchTerm);
            setServerFilters(filters);
            setPage(nextPage);
          }}
          renderItem={renderDebtItem}
          emptyStateMessage="Belum ada data hutang/piutang"
          title="Manajemen Hutang/Piutang"
          description="Kelola hutang dan piutang Anda"
          headerActions={
            debts && debts.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Hutang/Piutang
              </Button>
            )
          }
        />

        {(!debts || debts.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data Pertama
            </Button>
          </div>
        )}

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

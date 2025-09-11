import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetDialog from "@/components/budget/BudgetDialog";
import Layout from "@/components/Layout";
import { useDeleteBudget } from "@/hooks/queries/use-budgets";
import { useBudgetsPaginated } from "@/hooks/queries/paginated/use-budgets-paginated";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import ConfirmationModal from "@/components/ConfirmationModal";
import { BudgetModel } from "@/models/budgets";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";


const Budget = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetModel | undefined>(undefined);
  const navigate = useNavigate();
  const { mutate: deleteBudget } = useDeleteBudget();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useBudgetsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const budgets = paged?.data || [];
  const { data: currencies } = useCurrencies();

  const handleEdit = (budget: BudgetModel) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleView = (budget: BudgetModel) => {
    navigate(`/budget/${budget.id}`);
  };

  const handleDeleteClick = (budgetId: number) => {
    setBudgetToDelete(budgetId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  const renderBudgetItem = (budget: BudgetModel) => (
    <Card key={budget.id} className="bg-white border sm:border border-gray-100 sm:border-gray-200 rounded-xl sm:rounded-lg p-4 sm:p-3 shadow-sm hover:shadow-md sm:hover:shadow-sm hover:border-gray-200 transition-all duration-200 sm:duration-75">
      <div className="space-y-3 sm:space-y-2">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 sm:gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg sm:text-base text-gray-900 truncate mb-2 sm:mb-1">{budget.name}</h3>
            <div className="flex items-center gap-2 sm:gap-1">
              <Calendar className="w-4 h-4 sm:w-3 sm:h-3 text-blue-600" />
              <span className="text-sm sm:text-xs text-blue-700">
                {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Amount display */}
          <div className="text-right flex-shrink-0">
            <div className="text-xl sm:text-lg font-bold text-gray-900">
              {budget.amount.toLocaleString('id-ID')}
            </div>
            <div className="text-sm sm:text-xs font-medium text-gray-600">
              {budget.currency_code}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-1 pt-2 sm:pt-1 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => handleView(budget)}
          >
            <Eye className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => handleEdit(budget)}
          >
            <Edit className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => handleDeleteClick(budget.id)}
          >
            <Trash2 className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );

  const columnFilters: ColumnFilter[] = [
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
      field: "amount",
      label: "Jumlah Min",
      type: "number"
    },
    {
      field: "start_date",
      label: "Tanggal Mulai",
      type: "date"
    },
    {
      field: "end_date",
      label: "Tanggal Berakhir",
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
          title="Hapus Budget"
          description="Apakah Anda yakin ingin menghapus budget ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />

        <DataTable
          data={budgets}
          isLoading={isLoading}
          searchPlaceholder="Cari budget..."
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
          useUrlParams={true}
          renderItem={renderBudgetItem}
          emptyStateMessage="Belum ada budget yang dibuat"
          title="Manajemen Budget"
          description="Kelola anggaran keuangan Anda"
          headerActions={
            budgets && budgets.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Budget
              </Button>
            )
          }
        />

        {(!budgets || budgets.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Buat Budget Pertama
            </Button>
          </div>
        )}

        <BudgetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          budget={selectedBudget}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Budget;

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
    <Card key={budget.id} className="bg-white border-2 sm:border border-gray-100 sm:border-gray-200 rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-sm hover:shadow-lg sm:hover:shadow-md hover:border-gray-200 transition-all duration-200 sm:duration-75">
      <div className="space-y-4 sm:space-y-3">
        {/* Responsive Header Section */}
        <div className="flex items-start justify-between gap-4 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl sm:font-semibold sm:text-base text-gray-900 truncate mb-3 sm:mb-2">{budget.name}</h3>
            <div className="flex flex-col gap-3 sm:gap-2">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 sm:bg-green-50 rounded-xl sm:rounded-lg p-3 sm:p-2 border border-green-100 sm:border-transparent">
                <span className="text-base sm:text-sm font-bold sm:font-semibold text-green-700">
                  Budget: {budget.amount.toLocaleString('id-ID')} {budget.currency_code}
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 sm:bg-blue-50 rounded-xl sm:rounded-lg p-3 sm:p-2 border border-blue-100 sm:border-transparent">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-3 sm:h-3 text-blue-600" />
                  <span className="text-sm sm:text-xs font-semibold sm:font-medium text-blue-700">
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Amount display */}
          <div className="text-center flex-shrink-0">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 sm:bg-gray-50 rounded-2xl sm:rounded-lg p-4 sm:p-2 shadow-sm sm:shadow-none border border-gray-200 sm:border-transparent">
              <div className="text-2xl sm:text-lg font-bold text-gray-900">
                {budget.amount.toLocaleString('id-ID')}
              </div>
              <div className="text-sm sm:text-xs font-medium text-gray-600 mt-1 sm:mt-0">
                {budget.currency_code}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-2 border-t-2 sm:border-t border-gray-100">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-sm font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => handleView(budget)}
          >
            <Eye className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-sm font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => handleEdit(budget)}
          >
            <Edit className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal hover:bg-red-600 transition-all"
            onClick={() => handleDeleteClick(budget.id)}
          >
            <Trash2 className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
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

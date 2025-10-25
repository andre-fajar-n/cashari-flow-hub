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
import { useBudgetSummary } from "@/hooks/queries/use-budget-summary";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import ConfirmationModal from "@/components/ConfirmationModal";
import { BudgetModel, BudgetSummary } from "@/models/budgets";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { calculateTotalSpentInBaseCurrency } from "@/lib/budget-summary";
import { useUserSettings } from "@/hooks/queries/use-user-settings";

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
  const { data: paged, isLoading: isLoadingBudgets } = useBudgetsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const budgets = paged?.data || [];
  const { data: currencies, isLoading: isLoadingCurrencies } = useCurrencies();
  const { data: budgetSummary, isLoading: isLoadingBudgetSummary } = useBudgetSummary();
  const { data: userSettings, isLoading: isLoadingUserSettings } = useUserSettings();

  // Combine all loading states
  const isLoading = isLoadingBudgets || isLoadingCurrencies || isLoadingBudgetSummary || isLoadingUserSettings;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Layout>
      </ProtectedRoute>)
  }

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

  // Group budget summary by budget_id similar to debt list
  const groupedSummaryById = (budgetSummary ?? []).reduce((acc, item) => {
    if (!acc[item.budget_id]) {
      acc[item.budget_id] = [];
    }
    acc[item.budget_id].push(item);
    return acc;
  }, {} as Record<number, BudgetSummary[]>);

  const renderBudgetItem = (budget: BudgetModel) => {
    const summaries = groupedSummaryById[budget.id];
    const totalSpent = summaries ? calculateTotalSpentInBaseCurrency(summaries) : null;
    const remainingBudget = budget.amount + (totalSpent?.total_spent || 0);
    const spentPercentage = budget.amount ? (Math.abs(totalSpent?.total_spent || 0) / budget.amount) * 100 : 0;
    const isOverBudget = remainingBudget < 0;

    return (
    <Card key={budget.id} className="bg-white border sm:border border-gray-100 sm:border-gray-200 rounded-xl sm:rounded-lg p-4 sm:p-3 shadow-sm hover:shadow-md sm:hover:shadow-sm hover:border-gray-200 transition-all duration-200 sm:duration-75">
      <div className="space-y-3 sm:space-y-2">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 sm:gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg sm:text-base text-gray-900 truncate mb-2 sm:mb-1">{budget.name}</h3>
            <div className="flex items-center gap-2 sm:gap-1">
              <Calendar className="w-4 h-4 sm:w-3 sm:h-3 text-blue-600" />
              <span className="text-sm sm:text-xs text-blue-700">
                {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
              </span>
            </div>
          </div>

          {/* Budget Amount */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">Budget</div>
            <div className="text-xl sm:text-lg font-bold text-gray-900">
              {formatAmountCurrency(budget.amount, userSettings?.base_currency_code || '')}
            </div>
          </div>
        </div>

        {/* Budget Status Section */}
        {!totalSpent ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-2">
            <div className="text-center text-sm sm:text-xs text-yellow-700 font-medium">
              Belum ada transaksi
            </div>
          </div>
        ) : totalSpent.can_calculate ? (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="relative w-full h-6 sm:h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverBudget
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : spentPercentage > 80
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-semibold ${isOverBudget ? 'text-white' : 'text-gray-700'}`}>
                  {spentPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Budget Details */}
            <div className="grid grid-cols-2 gap-2">
              {/* Terpakai */}
              <div className={`rounded-lg p-2 sm:p-1.5 ${
                isOverBudget ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className={`text-xs font-medium ${isOverBudget ? 'text-red-700' : 'text-blue-700'}`}>
                  Terpakai
                </div>
                <div className={`text-sm sm:text-xs font-bold ${isOverBudget ? 'text-red-900' : 'text-blue-900'}`}>
                  {formatAmountCurrency(Math.abs(totalSpent.total_spent) || 0, userSettings?.base_currency_code || '')}
                </div>
              </div>

              {/* Sisa / Berlebih */}
              <div className={`rounded-lg p-2 sm:p-1.5 ${
                isOverBudget
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className={`text-xs font-medium ${
                  isOverBudget ? 'text-red-700' : 'text-green-700'
                }`}>
                  {isOverBudget ? 'Berlebih' : 'Sisa'}
                </div>
                <div className={`text-sm sm:text-xs font-bold ${
                  isOverBudget ? 'text-red-900' : 'text-green-900'
                }`}>
                  {formatAmountCurrency(Math.abs(remainingBudget), userSettings?.base_currency_code || '')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-2">
            <div className="text-center text-sm sm:text-xs text-yellow-700 font-medium">
              Rate belum tersedia
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-1 border-t-2 sm:border-t border-gray-100">
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
  };

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

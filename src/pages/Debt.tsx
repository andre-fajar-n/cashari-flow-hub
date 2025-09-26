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
import { useDeleteDebt } from "@/hooks/queries/use-debts";
import { useDebtsPaginated } from "@/hooks/queries/paginated/use-debts-paginated";
import { useDebtSummary } from "@/hooks/queries/use-debt-summary";
import { DebtModel } from "@/models/debts";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { calculateTotalInBaseCurrency } from "@/lib/debt-summary";
import { DebtSummaryModel } from "@/models/debt-summary";

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
  const { data: debtSummary } = useDebtSummary();

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

  const groupedSummaryById = (debtSummary ?? []).reduce((acc, item) => {
    if (!acc[item.debt_id]) {
      acc[item.debt_id] = [];
    }
    acc[item.debt_id].push(item);
    return acc;
  }, {} as Record<number, DebtSummaryModel[]>);

  const renderDebtItem = (debt: DebtModel) => {
    const summaries = groupedSummaryById[debt.id];
    const totalAmount = summaries ? calculateTotalInBaseCurrency(summaries) : null;

    return (
    <Card key={debt.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base text-gray-900 truncate">{debt.name}</h3>
              <Badge
                variant={debt.status === 'active' ? 'default' : 'secondary'}
                className="text-xs px-2 py-1 rounded-md font-medium"
              >
                {debt.status === 'active' ? 'Aktif' : 'Lunas'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                debt.type === DEBT_TYPES.LOAN
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {debt.type === DEBT_TYPES.LOAN ? 'Hutang' : 'Piutang'}
              </span>

              {debt.due_date && (
                <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3" />
                  <span>Jatuh tempo: {formatDate(debt.due_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount display */}
          <div className="text-right flex-shrink-0">
            {!totalAmount ? (
              <div>
                <div className="text-sm font-medium text-gray-600">
                  {debt.currency_code}
                </div>
                <div className="text-xs text-yellow-600">
                  Belum ada transaksi
                </div>
              </div>
            ) : totalAmount.can_calculate ? (
              // Show base currency amount if available
              <div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Total dalam {totalAmount.base_currency_code}
                  </div>
                  <div className={`text-lg font-bold ${
                    (totalAmount.total_income + totalAmount.total_outcome) > 0
                      ? 'text-green-700'
                      : (totalAmount.total_income + totalAmount.total_outcome) < 0
                        ? 'text-red-700'
                        : 'text-gray-700'
                  }`}>
                    {formatAmountCurrency(
                      totalAmount.total_income + totalAmount.total_outcome,
                      totalAmount.base_currency_code || ''
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Show original currency if no base currency conversion
              <div>
                <div className="text-sm font-medium text-gray-600">
                  {debt.currency_code}
                </div>
                <div className="text-xs text-yellow-600">
                  Exchange rate belum tersedia
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 pt-1 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => handleViewHistory(debt)}
          >
            <History className="w-3 h-3 mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => handleEdit(debt)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs"
            onClick={() => handleDeleteClick(debt)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
    );
  };

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
          useUrlParams={true}
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

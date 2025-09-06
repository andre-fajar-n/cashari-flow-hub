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
    <Card key={debt.id} className="bg-white border-2 sm:border border-gray-100 sm:border-gray-200 rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-sm hover:shadow-lg sm:hover:shadow-md hover:border-gray-200 transition-all duration-200 sm:duration-75">
      <div className="space-y-4 sm:space-y-3">
        {/* Responsive Header Section */}
        <div className="flex items-start justify-between gap-4 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3 sm:gap-2 mb-3 sm:mb-2">
              <h3 className="font-bold text-xl sm:font-semibold sm:text-base text-gray-900 truncate">{debt.name}</h3>
              <div className="flex justify-center sm:justify-start">
                <Badge
                  variant={debt.status === 'active' ? 'default' : 'secondary'}
                  className="text-sm sm:text-xs px-4 sm:px-2 py-2 sm:py-1 rounded-full sm:rounded-md font-bold sm:font-medium shadow-sm sm:shadow-none"
                >
                  {debt.status === 'active' ? '🔄 Aktif' : '✅ Lunas'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-2">
              <div className={`rounded-xl sm:rounded-lg p-3 sm:p-2 border ${
                debt.type === DEBT_TYPES.LOAN
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 sm:bg-red-50 border-red-100 sm:border-transparent'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 sm:bg-green-50 border-green-100 sm:border-transparent'
              }`}>
                <span className={`text-base sm:text-sm font-bold sm:font-semibold ${
                  debt.type === DEBT_TYPES.LOAN ? 'text-red-700' : 'text-green-700'
                }`}>
                  {debt.type === DEBT_TYPES.LOAN ? '💸 Hutang' : '💰 Piutang'}
                </span>
              </div>

              {debt.due_date && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 sm:bg-orange-50 rounded-xl sm:rounded-lg p-3 sm:p-2 border border-orange-100 sm:border-transparent">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-3 sm:h-3 text-orange-600" />
                    <span className="text-sm sm:text-xs font-semibold sm:font-medium text-orange-700">
                      Jatuh tempo: {new Date(debt.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Responsive Amount display */}
          <div className="text-center flex-shrink-0">
            <div className={`rounded-2xl sm:rounded-lg p-4 sm:p-2 shadow-sm sm:shadow-none border-2 sm:border ${
              debt.type === DEBT_TYPES.LOAN
                ? 'bg-gradient-to-br from-red-50 to-red-100 sm:bg-red-50 border-red-200 sm:border-red-100'
                : 'bg-gradient-to-br from-green-50 to-green-100 sm:bg-green-50 border-green-200 sm:border-green-100'
            }`}>
              <div className={`text-2xl sm:text-lg font-bold ${
                debt.type === DEBT_TYPES.LOAN ? 'text-red-700' : 'text-green-700'
              }`}>
                {/* TODO: add total amount */}
                {/* {debt.amount.toLocaleString('id-ID')} */}
              </div>
              <div className="text-sm sm:text-xs font-medium text-gray-600 mt-1 sm:mt-0">
                {debt.currency_code}
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
            onClick={() => handleViewHistory(debt)}
          >
            <History className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-sm font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => handleEdit(debt)}
          >
            <Edit className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal hover:bg-red-600 transition-all"
            onClick={() => handleDeleteClick(debt)}
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

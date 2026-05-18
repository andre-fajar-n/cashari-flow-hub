import { ColumnDef, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig, DateRangeFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { Button } from "@/components/ui/button";

export interface TransactionHistoryTableProps {
  columns: ColumnDef<MoneyMovementModel>[];
  data: MoneyMovementModel[];
  totalCount: number;
  isLoading: boolean;

  // Search
  searchTerm: string;
  onSearchChange: (search: string) => void;

  // Filters
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  selectFilters: SelectFilterConfig[];
  dateRangeFilter?: DateRangeFilterConfig;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Row selection & bulk actions
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
}

export const TransactionHistoryTable = ({
  columns,
  data,
  totalCount,
  isLoading,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  selectFilters,
  dateRangeFilter,
  page,
  pageSize,
  setPage,
  setPageSize,
  rowSelection,
  onRowSelectionChange,
  onBulkEdit,
  onBulkDelete,
}: TransactionHistoryTableProps) => {
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <AdvancedDataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowCanSelect={(row) => row.original.resource_type === MOVEMENT_TYPES.TRANSACTION}
      emptyState={{
        title: "Belum ada riwayat transaksi",
        description: "Mulai tambahkan transaksi untuk melihat riwayat",
      }}
      noResultsState={{
        title: "Tidak ada hasil",
        description: "Coba ubah filter atau kata kunci pencarian",
      }}
      toolbar={(table) => (
        <div className="space-y-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-sm font-medium text-primary flex-1">
                {selectedCount} transaksi dipilih
              </span>
              <Button size="sm" variant="outline" onClick={onBulkEdit}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={onBulkDelete}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Hapus
              </Button>
            </div>
          )}
          <AdvancedDataTableToolbar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Cari transaksi, kategori, dompet..."
            filters={filters}
            onFiltersChange={onFiltersChange}
            selectFilters={selectFilters}
            dateRangeFilter={dateRangeFilter}
            table={table}
          />
        </div>
      )}
    />
  );
};

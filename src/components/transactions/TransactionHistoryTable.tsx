import { ColumnDef } from "@tanstack/react-table";
import { MoneyMovementModel } from "@/models/money-movements";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig, DateRangeFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";

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
}

/**
 * Transaction History Table Component
 * 
 * Wrapper around AdvancedDataTable specifically for transaction history
 */
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
}: TransactionHistoryTableProps) => {
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
      emptyState={{
        title: "Belum ada riwayat transaksi",
        description: "Mulai tambahkan transaksi untuk melihat riwayat",
      }}
      noResultsState={{
        title: "Tidak ada hasil",
        description: "Coba ubah filter atau kata kunci pencarian",
      }}
      toolbar={(table) => (
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
      )}
    />
  );
};


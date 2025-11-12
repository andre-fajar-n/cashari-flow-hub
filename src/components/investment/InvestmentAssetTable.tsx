import { ColumnDef } from "@tanstack/react-table";
import { AdvancedDataTable, EmptyStateConfig } from "@/components/ui/advanced-data-table/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { Coins } from "lucide-react";

interface InvestmentAssetTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  isLoading?: boolean;
  // Custom toolbar props
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  instruments: InvestmentInstrumentModel[];
  // Empty state props
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function InvestmentAssetTable<TData, TValue>({
  columns,
  data,
  totalCount,
  isLoading = false,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  instruments,
  page,
  pageSize,
  setPage,
  setPageSize,
}: InvestmentAssetTableProps<TData, TValue>) {
  // Configure select filters
  const selectFilters: SelectFilterConfig[] = [
    {
      key: "instrument_id",
      placeholder: "Semua Instrumen",
      options: instruments.map((instrument) => ({
        label: instrument.name,
        value: instrument.id.toString(),
      })),
      width: "w-[200px]",
    },
  ];

  // Configure empty state
  const emptyState: EmptyStateConfig = {
    icon: <Coins className="w-12 h-12 text-gray-400" />,
    title: "Belum ada aset investasi",
    description: "Mulai dengan menambahkan aset investasi pertama Anda",
  };

  // Configure no results state
  const noResultsState: EmptyStateConfig = {
    title: "Tidak ada hasil",
    description: "Tidak ada data yang sesuai dengan filter.",
  };

  // Check if there are active filters
  const hasActiveFilters = !!searchTerm || Object.keys(filters).length > 0;

  return (
    <AdvancedDataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      isLoading={isLoading}
      emptyState={emptyState}
      noResultsState={noResultsState}
      hasActiveFilters={hasActiveFilters}
      toolbar={(table) => (
        <AdvancedDataTableToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Cari nama aset atau symbol..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectFilters={selectFilters}
          table={table}
        />
      )}
    />
  );
}


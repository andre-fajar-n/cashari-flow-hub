import { AdvancedDataTable, DataTableColumnHeader } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { DebtModel } from "@/models/debts";
import { DebtSummaryModel } from "@/models/debt-summary";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { calculateTotalInBaseCurrency } from "@/lib/debt-summary";
import { Badge } from "@/components/ui/badge";
import { DEBT_TYPES } from "@/constants/enums";
import { UserSettingsModel } from "@/models/user-settings";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface DebtTableProps {
  debts: DebtModel[];
  isLoading: boolean;
  totalCount: number;

  // Search
  searchTerm: string;
  onSearchChange: (search: string) => void;

  // Filters
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  selectFilters?: SelectFilterConfig[];

  // Pagination
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  // Actions
  onEdit: (debt: DebtModel) => void;
  onDelete: (debtId: number) => void;
  onViewHistory: (debt: DebtModel) => void;

  // Debt-specific data
  debtSummary?: DebtSummaryModel[];

  userSettings: UserSettingsModel;
}

/**
 * Debt Table Component
 * 
 * Wrapper around AdvancedDataTable specifically for debts
 */
export const DebtTable = ({
  debts,
  isLoading,
  totalCount,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  selectFilters = [],
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onViewHistory,
  debtSummary = [],
  userSettings,
}: DebtTableProps) => {
  // Group debt summary by debt_id
  const groupedSummaryById = debtSummary.reduce((acc, item) => {
    if (!acc[item.debt_id]) {
      acc[item.debt_id] = [];
    }
    acc[item.debt_id].push(item);
    return acc;
  }, {} as Record<number, DebtSummaryModel[]>);

  const columns: ColumnDef<DebtModel>[] = [
    {
      accessorKey: "nama",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
      enableSorting: false,
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <div className="space-y-2">
            <div className="font-semibold text-gray-900">{debt.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "tipe",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipe" />,
      enableSorting: false,
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${debt.type === DEBT_TYPES.LOAN
            ? 'bg-red-50 text-red-700'
            : 'bg-green-50 text-green-700'
            }`}>
            {debt.type === DEBT_TYPES.LOAN ? 'Hutang' : 'Piutang'}
          </span>
        );
      },
    },
    {
      accessorKey: "Tenggat Waktu",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tenggat Waktu" />,
      enableSorting: false,
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <div className="text-xs text-gray-700">
            {debt.due_date ? formatDate(debt.due_date) : 'Tidak ada'}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      enableSorting: false,
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <Badge
            variant={debt.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {debt.status === 'active' ? 'Aktif' : 'Lunas'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" className="justify-end" />,
      enableSorting: false,
      cell: ({ row }) => {
        const debt = row.original;
        const summaries = groupedSummaryById[debt.id];
        const totalAmount = summaries ? calculateTotalInBaseCurrency(summaries) : null;

        if (!totalAmount) {
          return (
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">
                {userSettings?.base_currency_code}
              </div>
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 mt-1">
                Belum ada transaksi
              </Badge>
            </div>
          );
        }

        if (!totalAmount.can_calculate) {
          return (
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">
                {userSettings?.base_currency_code}
              </div>
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 mt-1">
                Kurs belum tersedia
              </Badge>
            </div>
          );
        }

        const balance = totalAmount.total_income + totalAmount.total_outcome;
        const colorClass = balance > 0
          ? 'text-green-700'
          : balance < 0
            ? 'text-red-700'
            : 'text-gray-700';

        return (
          <div className="text-right space-y-1">
            <div className="text-xs text-gray-500">
              Total dalam {totalAmount.base_currency_code}
            </div>
            <div className={`text-lg font-bold ${colorClass}`}>
              {formatAmountCurrency(balance, totalAmount.base_currency_code, totalAmount.base_currency_symbol)}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right block">Aksi</span>,
      cell: ({ row }) => {
        const debt = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewHistory(debt)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lihat Riwayat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(debt)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(debt.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <AdvancedDataTable
      columns={columns}
      data={debts}
      totalCount={totalCount}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyState={{
        title: "Belum ada hutang/piutang",
        description: "Mulai tambahkan hutang/piutang untuk mengelola keuangan Anda",
      }}
      noResultsState={{
        title: "Tidak ada hasil",
        description: "Coba ubah filter atau kata kunci pencarian",
      }}
      toolbar={(table) => (
        <AdvancedDataTableToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Cari hutang/piutang..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectFilters={selectFilters}
          table={table}
        />
      )}
    />
  );
};


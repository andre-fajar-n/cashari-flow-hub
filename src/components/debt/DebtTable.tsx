import { AdvancedDataTable, DataTableColumnHeader } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { DebtModel } from "@/models/debts";
import { DebtSummaryModel } from "@/models/debt-summary";
import { Edit, Trash2, Eye, Calendar, AlertTriangle } from "lucide-react";
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
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{debt.name}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs ${debt.type === DEBT_TYPES.LOAN ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
              >
                {debt.type === DEBT_TYPES.LOAN ? 'Hutang' : 'Piutang'}
              </Badge>
              <Badge variant={debt.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {debt.status === 'active' ? 'Aktif' : 'Lunas'}
              </Badge>
            </div>
            {debt.due_date && (
              <div className="flex items-center gap-1 text-xs text-blue-700">
                <Calendar className="w-3 h-3" />
                <span>Jatuh Tempo: {formatDate(debt.due_date)}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Saldo" className="justify-end" />,
      enableSorting: false,
      cell: ({ row }) => {
        const debt = row.original;
        const summaries = groupedSummaryById[debt.id];
        const totalAmount = summaries ? calculateTotalInBaseCurrency(summaries) : null;

        if (!totalAmount) {
          return (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Belum ada transaksi</span>
            </div>
          );
        }

        if (!totalAmount.can_calculate) {
          return (
            <div className="flex items-center justify-end gap-1 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Kurs tidak tersedia</span>
            </div>
          );
        }

        const balance = totalAmount.total_income + totalAmount.total_outcome;
        const colorClass = balance > 0 ? 'text-emerald-700' : balance < 0 ? 'text-rose-700' : 'text-muted-foreground';

        return (
          <div className="text-right space-y-0.5">
            <div className="text-xs text-muted-foreground">dalam {totalAmount.base_currency_code}</div>
            <div className={`text-base font-bold tabular-nums ${colorClass}`}>
              {formatAmountCurrency(Math.abs(balance), totalAmount.base_currency_code, totalAmount.base_currency_symbol)}
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


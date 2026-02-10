import { AdvancedDataTable, DataTableColumnHeader } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { BudgetModel, BudgetSummary } from "@/models/budgets";
import { Edit, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { calculateTotalSpentInBaseCurrency } from "@/lib/budget-summary";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserSettingsModel } from "@/models/user-settings";

export interface BudgetTableProps {
  budgets: BudgetModel[];
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
  onEdit: (budget: BudgetModel) => void;
  onDelete: (budgetId: number) => void;
  onView: (budget: BudgetModel) => void;

  // Budget-specific data
  budgetSummariesMap?: Record<number, BudgetSummary[]>;

  // User settings
  userSettings: UserSettingsModel;
}

/**
 * Budget Table Component
 *
 * Wrapper around AdvancedDataTable specifically for budgets
 */
export const BudgetTable = ({
  budgets,
  isLoading,
  totalCount,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  selectFilters,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  budgetSummariesMap = {},
  userSettings,
}: BudgetTableProps) => {
  const columns: ColumnDef<BudgetModel>[] = [
    {
      accessorKey: "nama",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Budget" />,
      cell: ({ row }) => {
        const budget = row.original;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{budget.name}</div>
            <div className="flex items-center gap-1 text-xs text-blue-700">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(budget.start_date)} - {formatDate(budget.end_date)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" className="justify-end" />,
      cell: ({ row }) => {
        const budget = row.original;
        return (
          <div className="space-y-1 text-right">
            <div className="font-bold text-gray-900">
              {formatAmountCurrency(budget.amount, userSettings.currencies.code, userSettings.currencies.symbol)}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" className="justify-end" />,
      cell: ({ row }) => {
        const budget = row.original;
        const summaries = budgetSummariesMap[budget.id];
        const totalSpent = summaries ? calculateTotalSpentInBaseCurrency(summaries) : null;
        const remainingBudget = budget.amount + (totalSpent?.total_spent || 0);
        const spentPercentage = budget.amount ? (Math.abs(totalSpent?.total_spent || 0) / budget.amount) * 100 : 0;
        const isOverBudget = remainingBudget < 0;

        if (!totalSpent) {
          return (
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Belum ada transaksi
            </Badge>
          );
        }

        if (!totalSpent.can_calculate) {
          return (
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Kurs tidak tersedia
            </Badge>
          );
        }

        return (
          <div className="space-y-2 min-w-[200px]">
            {/* Progress Bar */}
            <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isOverBudget
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
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Terpakai: </span>
                <span className={`font-semibold ${isOverBudget ? 'text-red-700' : 'text-blue-700'}`}>
                  {formatAmountCurrency(Math.abs(totalSpent.total_spent) || 0, totalSpent.base_currency_code, totalSpent.base_currency_symbol)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{isOverBudget ? 'Berlebih: ' : 'Sisa: '}</span>
                <span className={`font-semibold ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
                  {formatAmountCurrency(Math.abs(remainingBudget), totalSpent.base_currency_code, totalSpent.base_currency_symbol)}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right block">Aksi</span>,
      cell: ({ row }) => {
        const budget = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(budget)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lihat Detail</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(budget)}
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
                  onClick={() => onDelete(budget.id)}
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
      data={budgets}
      totalCount={totalCount}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyState={{
        title: "Belum ada budget",
        description: "Mulai tambahkan budget untuk mengelola keuangan Anda",
      }}
      noResultsState={{
        title: "Tidak ada hasil",
        description: "Coba ubah filter atau kata kunci pencarian",
      }}
      toolbar={(table) => (
        <AdvancedDataTableToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Cari budget..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectFilters={selectFilters}
          table={table}
        />
      )}
    />
  );
};

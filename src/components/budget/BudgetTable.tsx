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
import { formatPercentage } from "@/lib/number";

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
            <div className="relative w-full h-5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isOverBudget
                  ? 'bg-rose-500'
                  : spentPercentage > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                  }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-semibold tabular-nums ${isOverBudget || spentPercentage > 60 ? 'text-white' : 'text-foreground'}`}>
                  {formatPercentage(spentPercentage)}%
                </span>
              </div>
            </div>

            {/* Budget Details */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">Budget</p>
                <p className="font-semibold tabular-nums">
                  {formatAmountCurrency(budget.amount, userSettings.currencies.code, userSettings.currencies.symbol)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Terpakai</p>
                <p className={`font-semibold tabular-nums ${isOverBudget ? 'text-rose-600' : 'text-rose-600'}`}>
                  {formatAmountCurrency(Math.abs(totalSpent.total_spent) || 0, totalSpent.base_currency_code, totalSpent.base_currency_symbol)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">{isOverBudget ? 'Berlebih' : 'Sisa'}</p>
                <p className={`font-semibold tabular-nums ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatAmountCurrency(Math.abs(remainingBudget), totalSpent.base_currency_code, totalSpent.base_currency_symbol)}
                </p>
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

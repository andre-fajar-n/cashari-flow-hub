import { AdvancedDataTable, DataTableColumnHeader } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { BusinessProjectModel, BusinessProjectSummaryModel } from "@/models/business-projects";
import { Edit, Trash2, Eye, Calendar, AlertTriangle, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface BusinessProjectTableProps {
  projects: BusinessProjectModel[];
  projectsSummary?: BusinessProjectSummaryModel[];
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
  onEdit: (project: BusinessProjectModel) => void;
  onDelete: (projectId: number) => void;
  onView: (project: BusinessProjectModel) => void;
}

/**
 * Business Project Table Component
 *
 * Wrapper around AdvancedDataTable specifically for business projects
 */
export const BusinessProjectTable = ({
  projects,
  projectsSummary,
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
}: BusinessProjectTableProps) => {
  // Create a map of project summaries by ID for quick lookup
  const summaryMap = projectsSummary?.reduce((acc, item) => {
    if (item.id) {
      acc[item.id] = item;
    }
    return acc;
  }, {} as Record<number, BusinessProjectSummaryModel>) || {};

  const columns: ColumnDef<BusinessProjectModel>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Proyek" />,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{project.name}</div>
            <div className="flex items-center gap-1 text-xs text-blue-700">
              <Calendar className="w-3 h-3" />
              <span>
                {project.start_date ? formatDate(project.start_date) : "Belum ditentukan"}
                {project.end_date && ` - ${formatDate(project.end_date)}`}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "ringkasan",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ringkasan" className="justify-center" />,
      cell: ({ row }) => {
        const project = row.original;
        const summary = summaryMap[project.id];

        if (!summary) {
          return (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Belum ada transaksi</span>
            </div>
          );
        }

        const canCalculate =
          summary.income_amount_in_base_currency !== null ||
          summary.expense_amount_in_base_currency !== null;

        if (!canCalculate) {
          return (
            <div className="flex items-center justify-end gap-1 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Kurs tidak tersedia</span>
            </div>
          );
        }

        const income = summary.income_amount_in_base_currency || 0;
        const expense = summary.expense_amount_in_base_currency || 0;
        const net = summary.net_amount_in_base_currency || 0;

        return (
          <div className="grid grid-cols-3 gap-3 text-xs min-w-[240px]">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                <ArrowUpCircle className="w-3 h-3 text-emerald-600" />
                <span>Pemasukan</span>
              </div>
              <p className="font-semibold tabular-nums text-emerald-700">
                {formatAmountCurrency(income, summary.base_currency_code, summary.base_currency_symbol)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                <ArrowDownCircle className="w-3 h-3 text-rose-600" />
                <span>Pengeluaran</span>
              </div>
              <p className="font-semibold tabular-nums text-rose-700">
                {formatAmountCurrency(expense, summary.base_currency_code, summary.base_currency_symbol)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>Net</span>
              </div>
              <p className={`font-semibold tabular-nums ${net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {net >= 0 ? "+" : ""}{formatAmountCurrency(Math.abs(net), summary.base_currency_code, summary.base_currency_symbol)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right block">Aksi</span>,
      cell: ({ row }) => {
        const project = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onView(project)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lihat Detail</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ubah</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(project.id)}
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
      data={projects}
      totalCount={totalCount}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyState={{
        title: "Belum ada proyek bisnis",
        description: "Mulai tambahkan proyek bisnis untuk mengelola bisnis Anda",
      }}
      noResultsState={{
        title: "Tidak ada hasil",
        description: "Coba ubah filter atau kata kunci pencarian",
      }}
      toolbar={(table) => (
        <AdvancedDataTableToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Cari proyek..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectFilters={selectFilters}
          table={table}
        />
      )}
    />
  );
};

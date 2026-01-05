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
            <div className="font-semibold">{project.name}</div>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "date_range",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Periode" />,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {project.start_date ? formatDate(project.start_date) : "Belum ditentukan"}
              {project.end_date && ` - ${formatDate(project.end_date)}`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "income",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pemasukan" />,
      cell: ({ row }) => {
        const project = row.original;
        const summary = summaryMap[project.id];
        
        if (!summary) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        const hasRate = summary.income_amount_in_base_currency !== null;
        
        return (
          <div className="flex items-center gap-1">
            <ArrowUpCircle className="w-3 h-3 text-green-600" />
            {hasRate ? (
              <span className="text-sm font-medium text-green-700">
                {formatAmountCurrency(
                  summary.income_amount_in_base_currency || 0,
                  summary.base_currency_code,
                  summary.base_currency_symbol
                )}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Kurs N/A</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "expense",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pengeluaran" />,
      cell: ({ row }) => {
        const project = row.original;
        const summary = summaryMap[project.id];
        
        if (!summary) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        const hasRate = summary.expense_amount_in_base_currency !== null;
        
        return (
          <div className="flex items-center gap-1">
            <ArrowDownCircle className="w-3 h-3 text-red-600" />
            {hasRate ? (
              <span className="text-sm font-medium text-red-700">
                {formatAmountCurrency(
                  summary.expense_amount_in_base_currency || 0,
                  summary.base_currency_code,
                  summary.base_currency_symbol
                )}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Kurs N/A</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "net",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Net" />,
      cell: ({ row }) => {
        const project = row.original;
        const summary = summaryMap[project.id];
        
        if (!summary) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        const hasRate = summary.net_amount_in_base_currency !== null;
        const netAmount = summary.net_amount_in_base_currency || 0;
        
        return (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {hasRate ? (
              <span className={`text-sm font-bold ${netAmount >= 0 ? "text-green-700" : "text-red-700"}`}>
                {netAmount >= 0 ? "+" : ""}{formatAmountCurrency(
                  netAmount,
                  summary.base_currency_code,
                  summary.base_currency_symbol
                )}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Kurs N/A</span>
              </div>
            )}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(project)}
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
                  onClick={() => onEdit(project)}
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

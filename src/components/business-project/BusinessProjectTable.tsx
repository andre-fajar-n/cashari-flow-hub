import { AdvancedDataTable, DataTableColumnHeader, DataTableRowActions, RowAction } from "@/components/ui/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { BusinessProjectModel } from "@/models/business-projects";
import { Edit, Trash2, Eye, Calendar } from "lucide-react";
import { formatDate } from "@/lib/date";

export interface BusinessProjectTableProps {
  projects: BusinessProjectModel[];
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
  const columns: ColumnDef<BusinessProjectModel>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Proyek" />,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{project.name}</div>
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
          <div className="flex items-center gap-1 text-sm text-blue-700">
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
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const project = row.original;

        const actions: RowAction<BusinessProjectModel>[] = [
          {
            label: "Detail",
            icon: Eye,
            onClick: onView,
          },
          {
            label: "Ubah",
            icon: Edit,
            onClick: onEdit,
          },
          {
            label: "Hapus",
            icon: Trash2,
            onClick: (project) => onDelete(project.id),
            variant: "destructive",
            separator: true,
          },
        ];

        return <DataTableRowActions item={project} actions={actions} />;
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

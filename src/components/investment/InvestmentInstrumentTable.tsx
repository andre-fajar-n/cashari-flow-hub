import { ColumnDef } from "@tanstack/react-table";
import { AdvancedDataTable, EmptyStateConfig } from "@/components/ui/advanced-data-table/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { DataTableColumnHeader } from "@/components/ui/advanced-data-table/data-table-column-header";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { TrendingUp, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InvestmentInstrumentTableProps {
  data: InvestmentInstrumentModel[];
  totalCount: number;
  isLoading?: boolean;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  onEdit: (instrument: InvestmentInstrumentModel) => void;
  onDelete: (id: number) => void;
  onView?: (instrument: InvestmentInstrumentModel) => void;
}

export function InvestmentInstrumentTable({
  data,
  totalCount,
  isLoading = false,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  page,
  pageSize,
  setPage,
  setPageSize,
  onEdit,
  onDelete,
  onView,
}: InvestmentInstrumentTableProps) {
  // Define columns
  const columns: ColumnDef<InvestmentInstrumentModel>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Instrumen" />,
      cell: ({ row }) => {
        const instrument = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">{instrument.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "unit_label",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Label Unit" />,
      cell: ({ row }) => {
        const unitLabel = row.original.unit_label;
        return unitLabel ? (
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {unitLabel}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "is_trackable",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status Tracking" />,
      cell: ({ row }) => {
        const isTrackable = row.original.is_trackable;
        return (
          <Badge variant={isTrackable ? "default" : "secondary"}>
            {isTrackable ? "Dapat Dilacak" : "Tidak Dilacak"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right block">Aksi</span>,
      cell: ({ row }) => {
        const instrument = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {onView && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(instrument)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lihat Detail</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(instrument)}
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
                  onClick={() => onDelete(instrument.id)}
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

  // Configure select filters
  const selectFilters: SelectFilterConfig[] = [
    {
      label: "Status Tracking",
      key: "is_trackable",
      placeholder: "Semua Status",
      options: [
        { label: "Dapat Dilacak", value: "true" },
        { label: "Tidak Dilacak", value: "false" },
      ],
      width: "w-[180px]",
    },
  ];

  // Configure empty state
  const emptyState: EmptyStateConfig = {
    icon: <TrendingUp className="w-12 h-12 text-muted-foreground" />,
    title: "Belum ada instrumen investasi",
    description: "Mulai dengan menambahkan instrumen investasi pertama Anda",
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
          searchPlaceholder="Cari nama instrumen..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectFilters={selectFilters}
          table={table}
        />
      )}
    />
  );
}

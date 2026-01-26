import { ColumnDef } from "@tanstack/react-table";
import { AdvancedDataTable, EmptyStateConfig } from "@/components/ui/advanced-data-table/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { DataTableColumnHeader } from "@/components/ui/advanced-data-table/data-table-column-header";
import { TrendingUp, Edit, Trash2, Eye, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InstrumentSummary } from "@/hooks/queries/use-instrument-summary";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { cn } from "@/lib/utils/cn";

interface InstrumentSummaryTableProps {
  data: InstrumentSummary[];
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
  onEdit: (instrument: InstrumentSummary) => void;
  onDelete: (id: number) => void;
  onView?: (instrument: InstrumentSummary) => void;
}

// Helper component for ROI with tooltip
const ROICell = ({ roi }: { roi: number | null }) => {
  if (roi === null) return <span className="text-muted-foreground">-</span>;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <AmountText amount={roi} showSign className="font-semibold">
              {Math.abs(roi).toFixed(2)}%
            </AmountText>
            <HelpCircle className="w-3 h-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          ROI dihitung berdasarkan currency instrumen dan tidak memperhitungkan dampak perubahan kurs.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper for dual currency display
const DualCurrencyCell = ({
  primaryAmount,
  primaryCurrency,
  secondaryAmount,
  secondaryCurrency,
  showSecondary = true,
}: {
  primaryAmount: number;
  primaryCurrency: string;
  secondaryAmount: number;
  secondaryCurrency: string;
  showSecondary?: boolean;
}) => {
  const isDifferentCurrency = primaryCurrency !== secondaryCurrency;
  
  return (
    <div className="space-y-0.5">
      <AmountText amount={primaryAmount} className="font-semibold block">
        {formatAmountCurrency(primaryAmount, primaryCurrency, primaryCurrency)}
      </AmountText>
      {showSecondary && isDifferentCurrency && (
        <span className="text-xs text-muted-foreground italic block">
          ≈ {formatAmountCurrency(secondaryAmount, secondaryCurrency, secondaryCurrency)}
        </span>
      )}
    </div>
  );
};

export function InstrumentSummaryTable({
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
}: InstrumentSummaryTableProps) {
  // Define columns
  const columns: ColumnDef<InstrumentSummary>[] = [
    {
      accessorKey: "instrumentName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Instrumen" />,
      cell: ({ row }) => {
        const instrument = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <span className="font-medium block">{instrument.instrumentName}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs font-mono">
                  {instrument.originalCurrencyCode}
                </Badge>
                {instrument.isTrackable && (
                  <Badge variant="secondary" className="text-xs">
                    Trackable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "activeCapital",
      header: ({ column }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <DataTableColumnHeader column={column} title="Modal Aktif" />
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              Dana yang saat ini masih aktif di instrumen ini.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      cell: ({ row }) => {
        const instrument = row.original;
        return (
          <span className="font-medium">
            {formatAmountCurrency(instrument.activeCapital, instrument.originalCurrencyCode, instrument.originalCurrencyCode)}
          </span>
        );
      },
    },
    {
      accessorKey: "currentValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nilai Saat Ini" />,
      cell: ({ row }) => {
        const instrument = row.original;
        return (
          <DualCurrencyCell
            primaryAmount={instrument.currentValue}
            primaryCurrency={instrument.originalCurrencyCode}
            secondaryAmount={instrument.currentValueBaseCurrency}
            secondaryCurrency={instrument.baseCurrencyCode}
          />
        );
      },
    },
    {
      accessorKey: "totalProfit",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Profit" />,
      cell: ({ row }) => {
        const instrument = row.original;
        return (
          <DualCurrencyCell
            primaryAmount={instrument.totalProfit}
            primaryCurrency={instrument.originalCurrencyCode}
            secondaryAmount={instrument.totalProfitBaseCurrency}
            secondaryCurrency={instrument.baseCurrencyCode}
          />
        );
      },
    },
    {
      accessorKey: "roi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ROI" />,
      cell: ({ row }) => <ROICell roi={row.original.roi} />,
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
                  onClick={() => onDelete(instrument.instrumentId)}
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
    <TooltipProvider>
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
    </TooltipProvider>
  );
}

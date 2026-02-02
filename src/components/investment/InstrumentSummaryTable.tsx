import { ColumnDef } from "@tanstack/react-table";
import { AdvancedDataTable, EmptyStateConfig } from "@/components/ui/advanced-data-table/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { DataTableColumnHeader } from "@/components/ui/advanced-data-table/data-table-column-header";
import { TrendingUp, Edit, Trash2, Eye, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InstrumentSummary, CurrencyBreakdown } from "@/hooks/queries/use-instrument-summary";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";

interface InstrumentSummaryTableProps {
  data: InvestmentInstrumentModel[];
  mapSummary: Record<number, InstrumentSummary>;
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
          ROI dihitung menggunakan base currency user agar konsisten dan dapat dibandingkan antar instrumen.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper to format currency breakdown as secondary info
const formatCurrencyBreakdown = (breakdown: CurrencyBreakdown[], field: 'activeCapital' | 'currentValue') => {
  if (breakdown.length === 0) return null;

  return breakdown
    .map(item => `${item.currencyCode} ${item[field].toLocaleString('id-ID', { maximumFractionDigits: 2 })}`)
    .join(' · ');
};

// Cell component for amounts with currency breakdown
const AmountWithBreakdownCell = ({
  primaryAmount,
  baseCurrency,
  breakdown,
  breakdownField,
  tooltipText,
}: {
  primaryAmount: number;
  baseCurrency: string;
  breakdown: CurrencyBreakdown[];
  breakdownField: 'activeCapital' | 'currentValue';
  tooltipText?: string;
}) => {
  const breakdownText = formatCurrencyBreakdown(breakdown, breakdownField);

  const content = (
    <div className="space-y-0.5">
      <span className="font-semibold block">
        {formatAmountCurrency(primaryAmount, baseCurrency, baseCurrency)}
      </span>
      {breakdownText && (
        <span className="text-xs text-muted-foreground block">
          ≈ {breakdownText}
        </span>
      )}
    </div>
  );

  if (tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Profit cell with color
const ProfitCell = ({
  amount,
  baseCurrency,
}: {
  amount: number;
  baseCurrency: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <AmountText amount={amount} showSign className="font-semibold">
              {formatAmountCurrency(Math.abs(amount), baseCurrency, baseCurrency)}
            </AmountText>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          Total Profit = Nilai Saat Ini – Modal Aktif, dihitung dan ditampilkan dalam base currency user.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function InstrumentSummaryTable({
  data,
  mapSummary,
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
  const columns: ColumnDef<InvestmentInstrumentModel>[] = [
    {
      accessorKey: "instrumentName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Instrumen" />,
      cell: ({ row }) => {
        const instrument = row.original;
        const summary = mapSummary[instrument.id];
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <span className="font-medium block">{instrument.name}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Currency Badge */}
                <Badge variant="outline" className="text-xs font-mono">
                  {summary?.isMultiCurrency
                    ? "Multi Currency"
                    : summary?.currencyBreakdown[0]?.currencyCode || summary?.baseCurrencyCode
                  }
                </Badge>
                {/* Trackable Badge */}
                {instrument.is_trackable && (
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
      accessorKey: "activeCapitalBaseCurrency",
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
              Total dana yang saat ini masih aktif di instrumen ini. Nilai utama dikonversi ke base currency user.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      cell: ({ row }) => {
        const instrument = row.original;
        const summary = mapSummary[instrument.id];
        return (
          <AmountWithBreakdownCell
            primaryAmount={summary?.activeCapitalBaseCurrency}
            baseCurrency={summary?.baseCurrencyCode}
            breakdown={summary?.currencyBreakdown}
            breakdownField="activeCapital"
          />
        );
      },
    },
    {
      accessorKey: "currentValueBaseCurrency",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nilai Saat Ini" />,
      cell: ({ row }) => {
        const instrument = row.original;
        const summary = mapSummary[instrument.id];
        return (
          <AmountWithBreakdownCell
            primaryAmount={summary?.currentValueBaseCurrency}
            baseCurrency={summary?.baseCurrencyCode}
            breakdown={summary?.currencyBreakdown}
            breakdownField="currentValue"
          />
        );
      },
    },
    {
      accessorKey: "totalProfitBaseCurrency",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Profit" />,
      cell: ({ row }) => {
        const instrument = row.original;
        const summary = mapSummary[instrument.id];
        return (
          <ProfitCell
            amount={summary?.totalProfitBaseCurrency}
            baseCurrency={summary?.baseCurrencyCode}
          />
        );
      },
    },
    {
      accessorKey: "roi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ROI" />,
      cell: ({ row }) => {
        const instrument = row.original;
        const summary = mapSummary[instrument.id];
        return <ROICell roi={summary?.roi} />;
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

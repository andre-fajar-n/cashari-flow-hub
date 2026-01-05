import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoalModel } from "@/models/goals";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table/advanced-data-table";
import { AdvancedDataTableToolbar, SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { DataTableColumnHeader } from "@/components/ui/advanced-data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { CurrencyModel } from "@/models/currencies";

interface GoalTableProps {
  data: GoalModel[];
  totalCount: number;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (goal: GoalModel) => void;
  onDelete: (goalId: number) => void;
  currencyOptions: { label: string; value: string }[];
  goalFundsSummary: Record<number, { goal_id: number; amount: number }>;
  currenciesMap: Record<string, CurrencyModel>;
}

export const GoalTable = ({
  data,
  totalCount,
  isLoading,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  currencyOptions,
  goalFundsSummary,
  currenciesMap,
}: GoalTableProps) => {
  const navigate = useNavigate();

  const handleView = (goal: GoalModel) => {
    navigate(`/goal/${goal.id}`);
  };

  const columns: ColumnDef<GoalModel>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nama Target" />
      ),
      cell: ({ row }) => {
        const goal = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{goal.name}</div>
            {goal.target_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Target: {formatDate(goal.target_date)}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_achieved",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const goal = row.original;
        if (goal.is_achieved) {
          return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">🎉 Tercapai</Badge>;
        }
        if (goal.is_active) {
          return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">🎯 Aktif</Badge>;
        }
        return <Badge variant="secondary">⏸️ Tidak Aktif</Badge>;
      },
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row }) => {
        const goal = row.original;
        const totalAmount = goalFundsSummary[goal.id]?.amount || 0;
        const percentage = Math.min((totalAmount / goal.target_amount) * 100, 100);
        const currency = currenciesMap[goal.currency_code];
        const collectedAmount = formatAmountCurrency(totalAmount, currency.code, currency.symbol);
        const targetAmount = formatAmountCurrency(goal.target_amount, currency.code, currency.symbol);

        return (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {collectedAmount} / {targetAmount}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: "target_amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target" />
      ),
      cell: ({ row }) => {
        const goal = row.original;
        const currency = currenciesMap[goal.currency_code];
        return (
          <div className="font-semibold text-blue-600">
            {formatAmountCurrency(goal.target_amount, currency.code, currency.symbol)}
          </div>
        );
      },
    },
    {
      accessorKey: "currency_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mata Uang" />
      ),
      cell: ({ row }) => {
        return <Badge variant="outline">{row.original.currency_code}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right block">Aksi</span>,
      cell: ({ row }) => {
        const goal = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(goal)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Select filters configuration
  const selectFilters: SelectFilterConfig[] = [
    {
      key: "is_achieved",
      label: "Status Pencapaian",
      placeholder: "Semua Status",
      options: [
        { label: "Tercapai", value: "true" },
        { label: "Belum Tercapai", value: "false" }
      ]
    },
    {
      key: "is_active",
      label: "Status Aktif",
      placeholder: "Semua Status",
      options: [
        { label: "Aktif", value: "true" },
        { label: "Tidak Aktif", value: "false" }
      ]
    },
    {
      key: "currency_code",
      label: "Mata Uang",
      placeholder: "Semua Mata Uang",
      options: currencyOptions
    },
  ];

  return (
    <AdvancedDataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyState={{
        title: "Belum ada target",
        description: "Mulai tambahkan target keuangan Anda",
      }}
      noResultsState={{
        title: "Tidak ada hasil",
        description: "Coba ubah filter atau kata kunci pencarian",
      }}
      toolbar={(table) => (
        <AdvancedDataTableToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Cari target..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectFilters={selectFilters}
          table={table}
        />
      )}
    />
  );
};


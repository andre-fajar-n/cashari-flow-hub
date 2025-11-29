import { ColumnDef } from "@tanstack/react-table";
import { MoneyMovementModel } from "@/models/money-movements";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader, DataTableRowActions, RowAction } from "@/components/ui/advanced-data-table";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  CreditCard,
  Building2,
  X,
} from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { getTransactionTypeConfig } from "@/components/ui/transaction-items/utils";

export interface TransactionHistoryColumnsProps {
  hideResourceType?: boolean;
  hideAdditionalInfo?: boolean;
  onEdit: (movement: MoneyMovementModel) => void;
  onDelete: (movement: MoneyMovementModel) => void;
  onRemoveFromBudget?: (transactionId: number) => void; // Optional: for budget detail page
  onRemoveFromProject?: (transactionId: number) => void; // Optional: for project detail page
}

/**
 * Generate column definitions for Transaction History table
 */
export const getTransactionHistoryColumns = ({
  hideResourceType,
  hideAdditionalInfo,
  onEdit,
  onDelete,
  onRemoveFromBudget,
  onRemoveFromProject,
}: TransactionHistoryColumnsProps): ColumnDef<MoneyMovementModel>[] => {
  const columns = []

  const resourceTypeColumn = {
    accessorKey: "resource_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" enableSorting={false} />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const movement = row.original;
      const typeConfig = getTransactionTypeConfig(movement.resource_type || "");
      const IconComponent = typeConfig.icon;

      return (
        <Badge
          variant="outline"
          className={`${typeConfig.className} font-medium text-xs px-2.5 py-1 rounded-md whitespace-nowrap`}
        >
          <IconComponent className="w-3.5 h-3.5 mr-1.5" />
          {typeConfig.text}
        </Badge>
      );
    },
  }

  const primaryColumns = [
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kategori" enableSorting={false} />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const movement = row.original;
        const isIncome = movement.amount > 0;
        const isExpense = movement.amount < 0;
        const hasDescription = !!movement.description;

        return (
          <div className="flex items-start gap-3 min-w-0">
            {/* Icon */}
            <div className={`flex-shrink-0 p-2 rounded-full bg-gray-50 ${!hasDescription ? 'self-center' : ''}`}>
              {isIncome ? (
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              ) : isExpense ? (
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
              ) : (
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${!hasDescription ? 'self-center' : ''}`}>
              <div className="font-semibold text-gray-900 truncate">
                {movement.category_name || "-"}
              </div>
              {hasDescription && (
                <div className="text-sm text-gray-600 truncate mt-0.5">
                  {movement.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "wallet_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dompet" enableSorting={false} />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const movement = row.original;
        const hasTransfer = movement.opposite_wallet_name || movement.opposite_goal_name;

        return (
          <div className="space-y-1">
            {/* Primary Wallet/Goal */}
            <div className="flex items-center gap-1.5">
              <div className="font-medium text-gray-900 text-sm">
                {movement.wallet_name || movement.goal_name || "-"}
              </div>
            </div>

            {/* Transfer Info - Simple display */}
            {hasTransfer && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <ArrowLeftRight className="w-3 h-3" />
                <span>
                  {movement.amount > 0 ? "Dari" : "Ke"}{" "}
                  {movement.opposite_wallet_name || movement.opposite_goal_name}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tanggal" enableSorting={false} />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const movement = row.original;
        return (
          <div className="text-sm text-gray-700 whitespace-nowrap">
            {formatDate(movement.date)}
          </div>
        );
      },
    },
  ];

  const additionalInfoColumn = {
    id: "additional_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Info Tambahan" enableSorting={false} />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const movement = row.original;
      const isTransaction = movement.resource_type === MOVEMENT_TYPES.TRANSACTION;
      const isInvestment = movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH;
      const isGoalTransfer = movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER;
      const isDebt = movement.resource_type === MOVEMENT_TYPES.DEBT_HISTORY;

      const budgetCount = movement.budget_ids?.length || 0;
      const projectCount = movement.project_ids?.length || 0;
      const hasInvestmentInfo = movement.goal_name || movement.instrument_name || movement.asset_name;
      const hasGoalTransferInfo = movement.goal_name || movement.instrument_name || movement.asset_name;

      const hasAnyInfo = budgetCount > 0 || projectCount > 0 || hasInvestmentInfo || hasGoalTransferInfo || (isDebt && movement.debt_name);

      if (!hasAnyInfo) {
        return <div className="text-xs text-center text-gray-400">-</div>;
      }

      return (
        <div className="space-y-1.5">
          {/* Budget Info - For Transactions */}
          {isTransaction && budgetCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-medium text-blue-700">Budget:</span>
              </div>
              <div className="pl-4 space-y-0.5">
                {movement.budget_names_text?.split(",").map((name, idx) => (
                  <div key={idx} className="text-xs text-gray-700">
                    • {name.trim()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Project Info - For Transactions */}
          {isTransaction && projectCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span className="text-xs font-medium text-green-700">Proyek:</span>
              </div>
              <div className="pl-4 space-y-0.5">
                {movement.business_project_names_text?.split(",").map((name, idx) => (
                  <div key={idx} className="text-xs text-gray-700">
                    • {name.trim()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment Growth Info */}
          {isInvestment && hasInvestmentInfo && (
            <div className="space-y-1">
              {movement.goal_name && (
                <div className="flex items-start gap-1.5">
                  <Target className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700">Goal: </span>
                    <span className="text-xs text-gray-600">{movement.goal_name}</span>
                  </div>
                </div>
              )}
              {movement.instrument_name && (
                <div className="flex items-start gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700">Instrumen: </span>
                    <span className="text-xs text-gray-600">{movement.instrument_name}</span>
                  </div>
                </div>
              )}
              {movement.asset_name && (
                <div className="flex items-start gap-1.5">
                  <TrendingUp className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700">Aset: </span>
                    <span className="text-xs text-gray-600">{movement.asset_name}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Goal Transfer Info */}
          {isGoalTransfer && hasGoalTransferInfo && (
            <div className="space-y-1">
              {/* Goal Transfer */}
              {(movement.goal_name) && (
                <div className="flex items-start gap-1.5">
                  <Target className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700">Goal: </span>
                    {movement.goal_name && movement.opposite_goal_name && movement.opposite_goal_name !== movement.goal_name ? (
                      <span className="text-xs text-gray-600">
                        {movement.amount > 0 ? (
                          <>{movement.opposite_goal_name} → {movement.goal_name}</>
                        ) : (
                          <>{movement.goal_name} → {movement.opposite_goal_name}</>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">
                        {movement.goal_name}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* Instrument Transfer */}
              {(movement.instrument_name) && (
                <div className="flex items-start gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700">Instrumen: </span>
                    {movement.instrument_name && movement.opposite_instrument_name && movement.opposite_instrument_name !== movement.instrument_name ? (
                      <span className="text-xs text-gray-600">
                        {movement.amount > 0 ? (
                          <>{movement.opposite_instrument_name} → {movement.instrument_name}</>
                        ) : (
                          <>{movement.instrument_name} → {movement.opposite_instrument_name}</>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">
                        {movement.instrument_name}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* Asset Transfer */}
              {(movement.asset_name) && (
                <div className="flex items-start gap-1.5">
                  <TrendingUp className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700">Aset: </span>
                    {movement.asset_name && movement.opposite_asset_name && movement.opposite_asset_name !== movement.asset_name ? (
                      <span className="text-xs text-gray-600">
                        {movement.amount > 0 ? (
                          <>{movement.opposite_asset_name} → {movement.asset_name}</>
                        ) : (
                          <>{movement.asset_name} → {movement.opposite_asset_name}</>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">
                        {movement.asset_name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Debt Info */}
          {isDebt && movement.debt_name && (
            <div className="flex items-start gap-1.5">
              <CreditCard className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700">Hutang/Piutang: </span>
                <span className="text-xs text-red-600">{movement.debt_name}</span>
              </div>
            </div>
          )}
        </div>
      );
    },
  }

  const amountColumn = {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Jumlah"
        className="justify-end"
      />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const movement = row.original;
      const isIncome = movement.amount > 0;
      const isExpense = movement.amount < 0;
      const colorClass = isIncome
        ? "text-green-600"
        : isExpense
          ? "text-red-600"
          : "text-blue-600";

      return (
        <div className="text-right">
          <div className={`font-bold text-base ${colorClass}`}>
            {formatAmountCurrency(movement.amount, movement.currency_code)}
          </div>

          {movement.exchange_rate ? (
            <>
              {movement.exchange_rate !== 1 && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatAmountCurrency(
                    movement.amount * movement.exchange_rate,
                    movement.base_currency_code || ""
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500 mt-0.5">
              Kurs tidak tersedia
            </div>
          )}

          {/* Amount Unit (for investments) */}
          {movement.amount_unit && (
            <div className="text-xs text-gray-500 mt-0.5">
              {movement.amount_unit.toLocaleString("id-ID")}{" "}
              {movement.unit_label || "tidak diketahui"}
            </div>
          )}
        </div>
      );
    },
  }

  const actionColumn = {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const movement = row.original;

      const actions: RowAction<MoneyMovementModel>[] = [];

      // Edit action (always available)
      actions.push({
        label: "Ubah",
        icon: Edit,
        onClick: onEdit,
      });

      // Delete action (always available)
      actions.push({
        label: "Hapus Transaksi",
        icon: Trash2,
        onClick: onDelete,
        variant: "destructive",
        separator: true,
      });

      // Remove from Budget action (only when onRemoveFromBudget is provided)
      if (onRemoveFromBudget) {
        actions.push({
          label: "Hapus dari Budget",
          icon: X,
          onClick: (movement) => onRemoveFromBudget(movement.resource_id),
          variant: "destructive",
        });
      }

      // Remove from Project action (only when onRemoveFromProject is provided)
      if (onRemoveFromProject) {
        actions.push({
          label: "Hapus dari Proyek",
          icon: X,
          onClick: (movement) => onRemoveFromProject(movement.resource_id),
          variant: "destructive",
        });
      }

      return <DataTableRowActions item={movement} actions={actions} />;
    },
  };

  if (!hideResourceType) {
    columns.push(resourceTypeColumn);
  }

  columns.push(...primaryColumns);

  if (!hideAdditionalInfo) {
    columns.push(additionalInfoColumn);
  }

  columns.push(...[amountColumn, actionColumn]);

  return columns;
}


import { ColumnDef } from "@tanstack/react-table";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { AssetSummaryData } from "@/models/money-summary";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader, DataTableRowActions, RowAction } from "@/components/ui/advanced-data-table";
import { Coins, Edit, Trash2, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export interface InvestmentAssetColumnsProps {
  assetSummaryGrouped: Record<number, AssetSummaryData>;
  onEdit: (asset: InvestmentAssetModel) => void;
  onDelete: (assetId: number) => void;
  onViewHistory: (asset: InvestmentAssetModel) => void;
}

/**
 * Generate column definitions for Investment Asset table
 * 
 * @param props - Configuration for column actions and data
 * @returns Array of column definitions for TanStack Table
 */
export const getInvestmentAssetColumns = ({
  assetSummaryGrouped,
  onEdit,
  onDelete,
  onViewHistory,
}: InvestmentAssetColumnsProps): ColumnDef<InvestmentAssetModel>[] => [
    {
      accessorKey: "nama",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Aset" />,
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Coins className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{asset.name}</span>
              {asset.symbol && (
                <Badge variant="outline" className="w-fit text-xs mt-1">
                  {asset.symbol}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "instrumen",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Instrumen" />,
      enableSorting: false,
      cell: ({ row }) => {
        const instrumentName = row.original.investment_instruments?.name;
        return (
          <Badge variant="secondary" className="font-medium">
            {instrumentName || "-"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "Modal Investasi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Modal Investasi" />,
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        const assetSummary = assetSummaryGrouped[asset.id];

        if (!assetSummary) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {formatAmountCurrency(assetSummary.totalAmount, assetSummary.currencyCode, assetSummary.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500">
              {assetSummary.totalAmountUnit.toLocaleString('id-ID')} unit
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Harga Rata-rata",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Rata-rata" />,
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        const assetSummary = assetSummaryGrouped[asset.id];

        if (!assetSummary || assetSummary.totalAmountUnit === 0) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        const averagePrice = assetSummary.totalAmount / assetSummary.totalAmountUnit;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {formatAmountCurrency(averagePrice, assetSummary.currencyCode, assetSummary.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500">per unit</span>
          </div>
        );
      },
    },
    {
      accessorKey: "Harga Pasar",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Pasar" />,
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        const assetSummary = assetSummaryGrouped[asset.id];

        if (!assetSummary?.latestAssetValue) {
          return <span className="text-gray-400 text-sm">Belum ada data</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {formatAmountCurrency(assetSummary.latestAssetValue, assetSummary.currencyCode, assetSummary.currencySymbol)}
            </span>
            {assetSummary.latestAssetValueDate && (
              <span className="text-xs text-gray-500">
                {formatDate(assetSummary.latestAssetValueDate)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "Nilai Portfolio",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nilai Portfolio" />,
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        const assetSummary = assetSummaryGrouped[asset.id];

        if (!assetSummary?.latestAssetValue) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        const currentValue = assetSummary.latestAssetValue * assetSummary.totalAmountUnit;

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {formatAmountCurrency(currentValue, assetSummary.currencyCode, assetSummary.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500">
              {assetSummary.totalAmountUnit.toLocaleString('id-ID')} unit × {formatAmountCurrency(assetSummary.latestAssetValue, assetSummary.currencyCode, assetSummary.currencySymbol)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Profit/Loss",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Profit/Loss" />,
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        const assetSummary = assetSummaryGrouped[asset.id];

        if (!assetSummary?.unrealizedAmount) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        const isProfit = assetSummary.unrealizedAmount >= 0;
        const Icon = isProfit ? ArrowUp : ArrowDown;
        const colorClass = isProfit ? "text-green-600" : "text-red-600";
        const bgClass = isProfit ? "bg-green-50" : "bg-red-50";

        return (
          <div className={`flex items-center gap-1 ${bgClass} px-2 py-1 rounded-lg w-fit`}>
            <Icon className={`w-3 h-3 ${colorClass}`} />
            <span className={`font-semibold text-sm ${colorClass}`}>
              {formatAmountCurrency(Math.abs(assetSummary.unrealizedAmount), assetSummary.currencyCode, assetSummary.currencySymbol)}
            </span>
            {assetSummary.amountChangePercentage !== null && (
              <span className={`text-xs ${colorClass}`}>
                ({assetSummary.amountChangePercentage.toFixed(2)}%)
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const asset = row.original;

        const actions: RowAction<InvestmentAssetModel>[] = [
          {
            label: "Lihat Detail",
            icon: Eye,
            onClick: onViewHistory,
          },
          {
            label: "Edit",
            icon: Edit,
            onClick: onEdit,
          },
          {
            label: "Hapus",
            icon: Trash2,
            onClick: (asset) => onDelete(asset.id),
            variant: "destructive",
            separator: true,
          },
        ];

        return <DataTableRowActions item={asset} actions={actions} />;
      },
    },
  ];


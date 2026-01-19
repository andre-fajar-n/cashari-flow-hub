import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useInvestmentAssetValuesPaginatedByAsset } from "@/hooks/queries/paginated/use-investment-asset-values-paginated";
import { InvestmentAssetValueModel } from "@/models/investment-asset-values";
import { useTableState } from "@/hooks/use-table-state";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table/advanced-data-table";
import { AdvancedDataTableToolbar } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { DataTableColumnHeader } from "@/components/ui/advanced-data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import AmountText from "@/components/ui/amount-text";
import AssetValueDialog from "@/components/investment/AssetValueDialog";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useDeleteInvestmentAssetValue, useCreateInvestmentAssetValue, useUpdateInvestmentAssetValue } from "@/hooks/queries/use-investment-asset-values";
import { AssetValueFormData, defaultAssetValueFormValues, mapAssetValueToFormData } from "@/form-dto/investment-asset-values";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AssetValueHistoryListProps {
  assetId: number;
  currencyCode: string;
  currencySymbol: string;
  /** When true, hide edit/delete actions (for non-trackable instruments with legacy data) */
  isReadOnly?: boolean;
}

const AssetValueHistoryList = ({ assetId, currencyCode, currencySymbol, isReadOnly = false }: AssetValueHistoryListProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  // Delete confirmation hook
  const deleteConfirmation = useDeleteConfirmation<number>({
    title: "Hapus Nilai Aset",
    description: "Apakah Anda yakin ingin menghapus nilai aset ini? Tindakan ini tidak dapat dibatalkan.",
  });

  const { data: paged, isLoading } = useInvestmentAssetValuesPaginatedByAsset(assetId, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const { mutate: deleteAssetValue } = useDeleteInvestmentAssetValue();
  const createAssetValue = useCreateInvestmentAssetValue();
  const updateAssetValue = useUpdateInvestmentAssetValue();

  const values = paged?.data || [];
  const totalCount = paged?.count || 0;

  // Form
  const form = useForm<AssetValueFormData>({
    defaultValues: { ...defaultAssetValueFormValues, asset_id: assetId },
  });

  // Dialog state using hook
  const valueDialog = useDialogState<InvestmentAssetValueModel, AssetValueFormData>({
    form,
    defaultValues: { ...defaultAssetValueFormValues, asset_id: assetId },
    mapDataToForm: mapAssetValueToFormData,
  });

  // Mutation callbacks
  const { handleSuccess: handleMutationSuccess, handleError } = useMutationCallbacks({
    setIsLoading: valueDialog.setIsLoading,
    onOpenChange: (open) => !open && valueDialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_ASSET_VALUES
  });

  const handleFormSubmit = (data: AssetValueFormData) => {
    if (!user) return;
    valueDialog.setIsLoading(true);

    if (valueDialog.selectedData) {
      updateAssetValue.mutate({ id: valueDialog.selectedData.id, ...data }, {
        onSuccess: handleMutationSuccess,
        onError: handleError
      });
    } else {
      createAssetValue.mutate(data, {
        onSuccess: handleMutationSuccess,
        onError: handleError
      });
    }
  };

  const handleDeleteClick = (value: InvestmentAssetValueModel) => {
    deleteConfirmation.openModal(value.id);
  };

  const handleConfirmDelete = (id: number) => {
    deleteAssetValue(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["investment_asset_values_paginated"] });
        queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
      }
    });
  };

  const columns: ColumnDef<InvestmentAssetValueModel>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tanggal" />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{formatDate(row.original.date)}</div>;
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nilai" />
      ),
      cell: ({ row }) => {
        const value = row.original.value;
        return (
          <AmountText amount={value}>
            {formatAmountCurrency(value, currencyCode, currencySymbol, 4)}
          </AmountText>
        );
      },
    },
    // Only show actions column if not in read-only mode
    ...(!isReadOnly ? [{
      id: "actions",
      header: () => <span className="text-right block">Aksi</span>,
      cell: ({ row }: { row: { original: InvestmentAssetValueModel } }) => {
        const value = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => valueDialog.openEdit(value)}
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
                  onClick={() => handleDeleteClick(value)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    } as ColumnDef<InvestmentAssetValueModel>] : []),
  ];

  // Date range filter configuration
  const dateRangeFilter = {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih rentang tanggal",
  };

  return (
    <>
      <AdvancedDataTable
        columns={columns}
        data={values}
        totalCount={totalCount}
        isLoading={isLoading}
        toolbar={(table) => (
          <AdvancedDataTableToolbar
            searchTerm={tableState.searchTerm}
            onSearchChange={tableActions.handleSearchChange}
            searchPlaceholder="Cari nilai..."
            filters={tableState.filters}
            onFiltersChange={tableActions.handleFiltersChange}
            selectFilters={[]}
            dateRangeFilter={dateRangeFilter}
            table={table}
          />
        )}
        page={tableState.page}
        pageSize={tableState.pageSize}
        onPageChange={tableActions.handlePageChange}
        onPageSizeChange={tableActions.handlePageSizeChange}
      />

      <AssetValueDialog
        open={valueDialog.open}
        onOpenChange={(open) => !open && valueDialog.close()}
        form={form}
        isLoading={valueDialog.isLoading}
        onSubmit={handleFormSubmit}
        assetValue={valueDialog.selectedData}
      />

      <DeleteConfirmationModal
        deleteConfirmation={deleteConfirmation}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default AssetValueHistoryList;

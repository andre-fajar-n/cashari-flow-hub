import { useState } from "react";
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
import { DataTableRowActions, RowAction } from "@/components/ui/advanced-data-table/data-table-row-actions";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import AmountText from "@/components/ui/amount-text";
import AssetValueDialog from "@/components/investment/AssetValueDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteInvestmentAssetValue, useCreateInvestmentAssetValue, useUpdateInvestmentAssetValue } from "@/hooks/queries/use-investment-asset-values";
import { AssetValueFormData, defaultAssetValueFormValues, mapAssetValueToFormData } from "@/form-dto/investment-asset-values";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";

interface AssetValueHistoryListProps {
  assetId: number;
  currencyCode: string;
  currencySymbol: string;
}

const AssetValueHistoryList = ({ assetId, currencyCode, currencySymbol }: AssetValueHistoryListProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });

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
    setDeleteModal({ open: true, id: value.id });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.id) {
      deleteAssetValue(deleteModal.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["investment_asset_values_paginated"] });
          queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
          setDeleteModal({ open: false, id: null });
        }
      });
    }
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
            {formatAmountCurrency(value, currencyCode, currencySymbol)}
          </AmountText>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const value = row.original;
        const actions: RowAction<InvestmentAssetValueModel>[] = [
          {
            label: "Edit",
            icon: Edit,
            onClick: valueDialog.openEdit,
          },
          {
            label: "Hapus",
            icon: Trash2,
            onClick: handleDeleteClick,
            variant: "destructive",
            separator: true,
          },
        ];

        return <DataTableRowActions item={value} actions={actions} />;
      },
    },
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

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={handleConfirmDelete}
        title="Hapus Nilai Aset"
        description="Apakah Anda yakin ingin menghapus nilai aset ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  );
};

export default AssetValueHistoryList;

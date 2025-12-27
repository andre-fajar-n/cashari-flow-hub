import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useCreateInvestmentAsset, useUpdateInvestmentAsset, useDeleteInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentAssetsPaginated } from "@/hooks/queries/paginated/use-investment-assets-paginated";
import { useAssetSummaries } from "@/hooks/queries/use-asset-summaries";
import { useTableState } from "@/hooks/use-table-state";
import { AssetSummaryData } from "@/models/money-summary";
import { InvestmentAssetTable } from "@/components/investment/InvestmentAssetTable";
import { getInvestmentAssetColumns } from "@/components/investment/InvestmentAssetColumns";
import { AssetFormData, defaultAssetFormValues } from "@/form-dto/investment-assets";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";

const InvestmentAsset = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investmentAssetToDelete, setInvestmentAssetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAssetModel | undefined>(undefined);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const { mutate: deleteInvestmentAsset } = useDeleteInvestmentAsset();
  const createAsset = useCreateInvestmentAsset();
  const updateAsset = useUpdateInvestmentAsset();

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 5,
  });

  const { data: paged, isLoading: isAssetsLoading } = useInvestmentAssetsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters,
  });
  const assets = paged?.data || [];
  const totalCount = paged?.count || 0;
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const { data: assetSummaries, isLoading: isAssetSummariesLoading } = useAssetSummaries();

  const isLoading = isAssetsLoading || isInstrumentsLoading || isAssetSummariesLoading;

  const assetSummaryGrouped = assetSummaries?.reduce((acc, summary) => {
    acc[summary.assetId] = summary;
    return acc;
  }, {} as Record<number, AssetSummaryData>);

  // Form
  const form = useForm<AssetFormData>({
    defaultValues: defaultAssetFormValues,
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: setIsFormLoading,
    onOpenChange: setIsDialogOpen,
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_ASSETS
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      if (selectedAsset) {
        form.reset({
          name: selectedAsset.name || "",
          symbol: selectedAsset.symbol || "",
          instrument_id: selectedAsset.instrument_id || null,
        });
      } else {
        form.reset(defaultAssetFormValues);
      }
    }
  }, [isDialogOpen, selectedAsset, form]);

  const handleFormSubmit = (data: AssetFormData) => {
    if (!user) return;
    setIsFormLoading(true);

    if (selectedAsset) {
      updateAsset.mutate({ id: selectedAsset.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createAsset.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  const handleEdit = (asset: InvestmentAssetModel) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (investmentAssetId: number) => {
    setInvestmentAssetToDelete(investmentAssetId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (investmentAssetToDelete) {
      deleteInvestmentAsset(investmentAssetToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedAsset(undefined);
    setIsDialogOpen(true);
  };

  const handleViewHistory = (asset: InvestmentAssetModel) => {
    navigate(`/investment-asset/${asset.id}`);
  };

  // Generate columns using separated column definitions
  const columns = getInvestmentAssetColumns({
    assetSummaryGrouped,
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
    onViewHistory: handleViewHistory,
  });

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Aset Investasi"
          description="Apakah Anda yakin ingin menghapus aset investasi ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aset Investasi</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola aset investasi dalam instrumen Anda
              </p>
            </div>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aset
            </Button>
          </div>

          {/* Investment Asset Table */}
          <InvestmentAssetTable
            columns={columns}
            data={assets}
            totalCount={totalCount}
            isLoading={isLoading}
            searchTerm={tableState.searchTerm}
            onSearchChange={tableActions.handleSearchChange}
            filters={tableState.filters}
            onFiltersChange={tableActions.handleFiltersChange}
            instruments={instruments || []}
            page={tableState.page}
            pageSize={tableState.pageSize}
            setPage={tableActions.handlePageChange}
            setPageSize={tableActions.handlePageSizeChange}
          />
        </div>

        <InvestmentAssetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          form={form}
          isLoading={isFormLoading}
          onSubmit={handleFormSubmit}
          asset={selectedAsset}
          instruments={instruments}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentAsset;

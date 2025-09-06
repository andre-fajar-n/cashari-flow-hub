import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Coins, Edit, Trash2, TrendingUp } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useDeleteInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentAssetsPaginated } from "@/hooks/queries/paginated/use-investment-assets-paginated";

const InvestmentAsset = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investmentAssetToDelete, setInvestmentAssetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAssetModel | undefined>(undefined);
  
  const { mutate: deleteInvestmentAsset } = useDeleteInvestmentAsset();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useInvestmentAssetsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const assets = paged?.data || [];
  const { data: instruments } = useInvestmentInstruments();

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

  const renderAssetItem = (asset: InvestmentAssetModel) => (
    <Card key={asset.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-green-100 rounded-full">
                <Coins className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 truncate">{asset.name}</h3>
              {asset.symbol && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {asset.symbol}
                </span>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-sm font-medium text-gray-700">
                Instrumen: {asset.investment_instruments?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Actions - Mobile responsive */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleViewHistory(asset)}
          >
            <TrendingUp className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Detail</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleEdit(asset)}
          >
            <Edit className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleDeleteClick(asset.id)}
          >
            <Trash2 className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Hapus</span>
          </Button>
        </div>
      </div>
    </Card>
  );

  const columnFilters: ColumnFilter[] = [
    {
      field: "instrument_id",
      label: "Instrumen",
      type: "select",
      options: instruments?.map(instrument => ({
        label: instrument.name,
        value: instrument.id.toString()
      })) || []
    }
  ];

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

        <DataTable
          data={assets}
          isLoading={isLoading}
          searchPlaceholder="Cari aset investasi..."
          searchFields={["name", "symbol"]}
          columnFilters={columnFilters}
          itemsPerPage={itemsPerPage}
          serverMode
          totalCount={paged?.count}
          page={page}
          onServerParamsChange={({ searchTerm, filters, page: nextPage }) => {
            setServerSearch(searchTerm);
            setServerFilters(filters);
            setPage(nextPage);
          }}
          renderItem={renderAssetItem}
          emptyStateMessage="Belum ada aset investasi yang dibuat"
          title="Aset Investasi"
          description="Kelola aset investasi dalam instrumen Anda"
          headerActions={
            assets && assets.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aset
              </Button>
            )
          }
        />

        {(!assets || assets.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aset Pertama
            </Button>
          </div>
        )}

        <InvestmentAssetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          asset={selectedAsset}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentAsset;

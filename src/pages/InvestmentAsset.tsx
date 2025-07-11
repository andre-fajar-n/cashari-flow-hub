import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Coins, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteInvestmentAsset, useInvestmentAssets } from "@/hooks/queries";
import ConfirmationModal from "@/components/ConfirmationModal";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";

const InvestmentAsset = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investmentAssetToDelete, setInvestmentAssetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAssetModel | undefined>(undefined);
  const { mutate: deleteInvestmentAsset } = useDeleteInvestmentAsset();
  const { data: assets, isLoading } = useInvestmentAssets();

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
      deleteInvestmentAsset(investmentAssetToDelete, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
          toast({
            title: "Berhasil",
            description: "Aset berhasil dihapus",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Gagal menghapus aset investasi: ${error.message}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleAddNew = () => {
    setSelectedAsset(undefined);
    setIsDialogOpen(true);
  };

  const renderAssetItem = (asset: InvestmentAssetModel) => (
    <Card key={asset.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold">{asset.name}</h3>
            {asset.symbol && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {asset.symbol}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Instrumen ID: {asset.instrument_id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Records</Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(asset)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteClick(asset.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );

  const filterOptions = [
    {
      label: "Memiliki Simbol",
      value: "with_symbol",
      filterFn: (asset: InvestmentAssetModel) => !!asset.symbol
    },
    {
      label: "Tanpa Simbol",
      value: "without_symbol",
      filterFn: (asset: InvestmentAssetModel) => !asset.symbol
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
          data={assets || []}
          isLoading={isLoading}
          searchPlaceholder="Cari aset investasi..."
          searchFields={["name", "symbol"]}
          filterOptions={filterOptions}
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
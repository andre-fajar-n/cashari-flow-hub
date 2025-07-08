
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coins, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteInvestmentAsset, useInvestmentAssets } from "@/hooks/queries";
import ConfirmationModal from "@/components/ConfirmationModal";
import { InvestmentAssetModel } from "@/models/investment-assets";

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

        <Card className="mb-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Aset Investasi</CardTitle>
              <p className="text-gray-600">Kelola aset investasi dalam instrumen Anda</p>
            </div>
            {assets && assets.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aset
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat aset investasi...</p>
              </div>
            ) : !assets || assets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada aset investasi yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Aset Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {assets.map((asset) => (
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
                        {asset.instrument_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Instrumen: {asset.instrument_name}
                          </p>
                        )}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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

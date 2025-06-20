
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coins, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { useToast } from "@/hooks/use-toast";

interface InvestmentAsset {
  id: number;
  name: string;
  symbol: string;
  instrument_id: number;
  created_at: string;
  investment_instruments?: {
    name: string;
  };
}

const InvestmentAsset = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAsset | undefined>(undefined);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["investment_assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_assets")
        .select(`
          *,
          investment_instruments (
            name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InvestmentAsset[];
    },
    enabled: !!user,
  });

  const handleEdit = (asset: InvestmentAsset) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleDelete = async (asset: InvestmentAsset) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus aset "${asset.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("investment_assets")
        .delete()
        .eq("id", asset.id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast({ title: "Aset berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menghapus aset",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedAsset(undefined);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-4">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
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
            {assets && assets.length > 0 ? (
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
                        {asset.investment_instruments && (
                          <p className="text-sm text-gray-600 mt-1">
                            Instrumen: {asset.investment_instruments.name}
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
                          onClick={() => handleDelete(asset)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada aset investasi yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Aset Pertama
                </Button>
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

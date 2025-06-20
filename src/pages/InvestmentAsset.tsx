
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coins } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

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
  const [isAdding, setIsAdding] = useState(false);

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

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Navbar />
          
          <Card className="mb-6">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Aset Investasi</CardTitle>
                <p className="text-gray-600">Kelola aset investasi dalam instrumen Anda</p>
              </div>
              {assets.length > 0 && (
                <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
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
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Hapus</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada aset investasi yang dibuat</p>
                  <Button onClick={() => setIsAdding(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Aset Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InvestmentAsset;

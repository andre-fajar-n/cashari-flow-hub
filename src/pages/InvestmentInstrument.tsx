
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

interface InvestmentInstrument {
  id: number;
  name: string;
  unit_label: string;
  is_trackable: boolean;
  created_at: string;
}

const InvestmentInstrument = () => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const { data: instruments, isLoading } = useQuery({
    queryKey: ["investment_instruments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_instruments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InvestmentInstrument[];
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
                <CardTitle>Instrumen Investasi</CardTitle>
                <p className="text-gray-600">Kelola jenis instrumen investasi Anda</p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Instrumen
              </Button>
            </CardHeader>
            <CardContent>
              {instruments && instruments.length > 0 ? (
                <div className="grid gap-4">
                  {instruments.map((instrument) => (
                    <Card key={instrument.id} className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold">{instrument.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {instrument.unit_label && (
                              <span className="text-sm text-gray-600">
                                Unit: {instrument.unit_label}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              instrument.is_trackable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {instrument.is_trackable ? 'Dapat Dilacak' : 'Tidak Dapat Dilacak'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Assets</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Hapus</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada instrumen investasi yang dibuat</p>
                  <Button onClick={() => setIsAdding(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Instrumen Pertama
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

export default InvestmentInstrument;


import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Selamat datang, {user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/settings")} variant="outline">
                Pengaturan
              </Button>
              <Button onClick={signOut} variant="destructive">
                Keluar
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dompet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wallets?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Dompet yang terdaftar
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Kategori tersedia
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mata Uang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currencies?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Mata uang terdaftar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dompet Saya</CardTitle>
                <CardDescription>
                  Daftar dompet yang telah dikonfigurasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                {wallets && wallets.length > 0 ? (
                  <div className="space-y-2">
                    {wallets.map((wallet) => (
                      <div key={wallet.id} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{wallet.name}</span>
                        <span className="text-sm text-gray-600">
                          {wallet.currency_code} {wallet.initial_amount?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada dompet yang dikonfigurasi</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kategori</CardTitle>
                <CardDescription>
                  Kategori pemasukan dan pengeluaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categories && categories.length > 0 ? (
                  <div className="space-y-2">
                    {categories.slice(0, 5).map((category) => (
                      <div key={category.id} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{category.name}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          category.is_income 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_income ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                    ))}
                    {categories.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{categories.length - 5} kategori lainnya
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada kategori yang dikonfigurasi</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;

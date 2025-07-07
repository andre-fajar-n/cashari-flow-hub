
import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallets, useCategories, useCurrencies } from "@/hooks/queries";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();

  return (
    <ProtectedRoute>
      <Layout>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                    <div key={wallet.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 border rounded gap-2">
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
                    <div key={category.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 border rounded gap-2">
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
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;

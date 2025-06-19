
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, TrendingUp, TrendingDown, Eye, EyeOff, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  // Redirect to auth if not authenticated
  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Berhasil keluar!");
  };

  // Mock data - will be replaced with real Supabase data
  const totalBalance = 12500000;
  const monthlyIncome = 8500000;
  const monthlyExpense = 3200000;

  const recentTransactions = [
    { id: 1, description: "Gaji Bulanan", amount: 8500000, type: "income", date: "2025-01-15" },
    { id: 2, description: "Belanja Groceries", amount: -450000, type: "expense", date: "2025-01-14" },
    { id: 3, description: "Transfer dari Tabungan", amount: 2000000, type: "income", date: "2025-01-13" },
    { id: 4, description: "Bayar Listrik", amount: -350000, type: "expense", date: "2025-01-12" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cashari</h1>
            <p className="text-gray-600">Selamat datang, {user?.user_metadata?.name || user?.email}!</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Balance */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Saldo</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-8 w-8 p-0"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {showBalance ? formatCurrency(totalBalance) : "••••••••"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Income */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pemasukan Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {showBalance ? formatCurrency(monthlyIncome) : "••••••••"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Expense */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pengeluaran Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-600">
                  {showBalance ? formatCurrency(monthlyExpense) : "••••••••"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Transaksi Terbaru</CardTitle>
                <CardDescription>Aktivitas keuangan terbaru Anda</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className={
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                    }>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

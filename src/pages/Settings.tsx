
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import CurrencyManagement from "@/components/settings/CurrencyManagement";
import WalletManagement from "@/components/settings/WalletManagement";
import CategoryManagement from "@/components/settings/CategoryManagement";

const Settings = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
              <CardDescription>
                Kelola mata uang, dompet, dan kategori untuk aplikasi keuangan Anda
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="currencies" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="currencies">Mata Uang</TabsTrigger>
              <TabsTrigger value="wallets">Dompet</TabsTrigger>
              <TabsTrigger value="categories">Kategori</TabsTrigger>
            </TabsList>

            <TabsContent value="currencies">
              <CurrencyManagement />
            </TabsContent>

            <TabsContent value="wallets">
              <WalletManagement />
            </TabsContent>

            <TabsContent value="categories">
              <CategoryManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;

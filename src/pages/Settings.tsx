import { Settings2, Wallet, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import WalletManagement from "@/components/settings/WalletManagement";
import CategoryManagement from "@/components/settings/CategoryManagement";
import UserSettingsManagement from "@/components/settings/UserSettingsManagement";

const Settings = () => {
  return (
    <ProtectedRoute>
      <Layout>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola mata uang, dompet, dan kategori untuk aplikasi keuangan Anda
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-11">
            <TabsTrigger value="general" className="text-xs sm:text-sm flex items-center gap-1.5">
              <Settings2 className="w-4 h-4" />
              <span>Umum</span>
            </TabsTrigger>
            <TabsTrigger value="wallets" className="text-xs sm:text-sm flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>Dompet</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span>Kategori</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <UserSettingsManagement />
          </TabsContent>

          <TabsContent value="wallets">
            <WalletManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
        </Tabs>
      </Layout>
    </ProtectedRoute>
  );
};

export default Settings;

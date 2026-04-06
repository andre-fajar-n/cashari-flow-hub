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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 px-6 py-5">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-sm shrink-0">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Kelola mata uang, dompet, dan kategori untuk aplikasi keuangan Anda
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full mt-6">
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

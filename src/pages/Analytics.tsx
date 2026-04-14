import { useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowLeftRight, TrendingUp, Target, LineChart } from "lucide-react";
import IkhtisarTab from "@/components/analytics/tabs/IkhtisarTab";
import ArusKasTab from "@/components/analytics/tabs/ArusKasTab";
import PortofolioTab from "@/components/analytics/tabs/PortofolioTab";
import TujuanTab from "@/components/analytics/tabs/TujuanTab";
import TrenSaldoTab from "@/components/analytics/tabs/TrenSaldoTab";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("ikhtisar");

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 px-6 py-5">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_top_left,white,transparent_70%)]" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-sm shrink-0">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Analisis mendalam keuangan Anda: arus kas, portofolio, tujuan, dan tren saldo.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="ikhtisar" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                Ikhtisar
              </TabsTrigger>
              <TabsTrigger value="arus-kas" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
                Arus Kas
              </TabsTrigger>
              <TabsTrigger value="portofolio" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                Portofolio
              </TabsTrigger>
              <TabsTrigger value="tujuan" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Target className="h-3.5 w-3.5 shrink-0" />
                Tujuan
              </TabsTrigger>
              <TabsTrigger value="tren-saldo" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <LineChart className="h-3.5 w-3.5 shrink-0" />
                Tren Saldo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ikhtisar" className="mt-4">
              <IkhtisarTab onNavigate={setActiveTab} />
            </TabsContent>

            <TabsContent value="arus-kas" className="mt-4">
              <ArusKasTab />
            </TabsContent>

            <TabsContent value="portofolio" className="mt-4">
              <PortofolioTab />
            </TabsContent>

            <TabsContent value="tujuan" className="mt-4">
              <TujuanTab />
            </TabsContent>

            <TabsContent value="tren-saldo" className="mt-4">
              <TrenSaldoTab />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Analytics;

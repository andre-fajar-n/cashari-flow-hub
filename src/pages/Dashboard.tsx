import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import MoneySummaryCard from "@/components/dashboard/MoneySummaryCard";
import { Button } from "@/components/ui/button";
import { Receipt, TrendingUp, Target, ArrowLeftRight } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: moneySummaries, isLoading: isMoneySummaryLoading } = useMoneySummary();

  const rawName = user?.email?.split("@")[0] ?? "";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/[._-]/g, " ");
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Greeting Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 px-6 py-5">
            <div className="relative">
              <p className="text-sm font-medium text-primary mb-0.5">{getGreeting()}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{displayName}</h1>
              <p className="text-muted-foreground text-sm mt-1">{today}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Aksi Cepat</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => navigate("/transaction-history")}
              >
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium">Riwayat Transaksi</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => navigate("/analytics/balance-trend")}
              >
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium">Tren Saldo</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => navigate("/goal")}
              >
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30">
                  <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-xs font-medium">Target</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => navigate("/debt")}
              >
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                  <ArrowLeftRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-xs font-medium">Hutang/Piutang</span>
              </Button>
            </div>
          </div>

          {/* Money Summary */}
          <MoneySummaryCard
            moneySummaries={moneySummaries || []}
            isLoading={isMoneySummaryLoading}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;

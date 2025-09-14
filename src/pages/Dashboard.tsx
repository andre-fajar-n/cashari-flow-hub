import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import MoneySummaryCard from "@/components/dashboard/MoneySummaryCard";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: moneySummaries, isLoading: isMoneySummaryLoading } = useMoneySummary();

  return (
    <ProtectedRoute>
      <Layout>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.email}</p>
        </div>

        {/* Money Summary */}
        <div className="mb-8">
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

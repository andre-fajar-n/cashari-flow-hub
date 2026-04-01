import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import MoneySummaryCard from "@/components/dashboard/MoneySummaryCard";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
};

const Dashboard = () => {
  const { user } = useAuth();

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
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-primary mb-0.5">{getGreeting()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
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


import StatCard from "@/components/StatCard";
import { CircleDollarSign, ArrowUp, ArrowDown } from "lucide-react";

const Dashboard = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Keuangan</h2>
        <p className="text-gray-600">Ringkasan keuangan Anda hari ini</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Saldo"
          amount={formatCurrency(balance)}
          icon={CircleDollarSign}
          type="balance"
          isPositive={balance >= 0}
        />
        <StatCard
          title="Total Pemasukan"
          amount={formatCurrency(totalIncome)}
          icon={ArrowUp}
          type="income"
          isPositive={true}
        />
        <StatCard
          title="Total Pengeluaran"
          amount={formatCurrency(totalExpense)}
          icon={ArrowDown}
          type="expense"
          isPositive={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;

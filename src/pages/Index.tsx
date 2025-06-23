
import { useState } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

const Index = () => {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "income",
      amount: 5000000,
      category: "Gaji",
      description: "Gaji bulanan",
      date: "2024-06-23"
    },
    {
      id: 2,
      type: "expense",
      amount: 150000,
      category: "Makanan",
      description: "Makan siang",
      date: "2024-06-23"
    },
    {
      id: 3,
      type: "expense",
      amount: 50000,
      category: "Transportasi",
      description: "Bensin motor",
      date: "2024-06-22"
    }
  ]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Dashboard transactions={transactions} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionForm onAddTransaction={addTransaction} />
          <TransactionList 
            transactions={transactions} 
            onDeleteTransaction={deleteTransaction} 
          />
        </div>
      </main>
    </div>
  );
};

export default Index;

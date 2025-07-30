
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Transaction from "@/pages/Transaction";
import Transfer from "@/pages/Transfer";
import Settings from "@/pages/Settings";
import Budget from "@/pages/Budget";
import Debt from "@/pages/Debt";
import DebtHistory from "@/pages/DebtHistory";
import BusinessProject from "@/pages/BusinessProject";
import BusinessProjectDetail from "@/pages/BusinessProjectDetail";
import Goal from "@/pages/Goal";
import GoalDetail from "@/pages/GoalDetail";
import InvestmentInstrument from "@/pages/InvestmentInstrument";
import InvestmentAsset from "@/pages/InvestmentAsset";
import AssetDetail from "@/pages/AssetDetail";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/debt" element={<Debt />} />
          <Route path="/debt/:id/history" element={<DebtHistory />} />
          <Route path="/business-project" element={<BusinessProject />} />
          <Route path="/business-project/:id" element={<BusinessProjectDetail />} />
          <Route path="/goal" element={<Goal />} />
          <Route path="/goal/:id" element={<GoalDetail />} />
          <Route path="/investment-instrument" element={<InvestmentInstrument />} />
          <Route path="/investment-asset" element={<InvestmentAsset />} />
          <Route path="/asset/:id" element={<AssetDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

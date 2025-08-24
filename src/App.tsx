import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Transaction from "@/pages/Transaction";
import Transfer from "@/pages/Transfer";
import Budget from "@/pages/Budget";
import BudgetDetail from "@/pages/BudgetDetail";
import Debt from "@/pages/Debt";
import DebtDetail from "@/pages/DebtDetail";
import BusinessProject from "@/pages/BusinessProject";
import Goal from "@/pages/Goal";
import GoalDetail from "@/pages/GoalDetail";
import InvestmentInstrument from "@/pages/InvestmentInstrument";
import InvestmentAsset from "@/pages/InvestmentAsset";
import AssetDetail from "@/pages/AssetDetail";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/hooks/use-auth";
import BusinessProjectDetail from "@/pages/BusinessProjectDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/budget/:id" element={<BudgetDetail />} />
            <Route path="/debt" element={<Debt />} />
            <Route path="/debt/:id/history" element={<DebtDetail />} />
            <Route path="/business-project" element={<BusinessProject />} />
            <Route path="/business-project/:id" element={<BusinessProjectDetail />} />
            <Route path="/goal" element={<Goal />} />
            <Route path="/goal/:id" element={<GoalDetail />} />
            <Route path="/investment-instrument" element={<InvestmentInstrument />} />
            <Route path="/investment-asset" element={<InvestmentAsset />} />
            <Route path="/investment-asset/:id" element={<AssetDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

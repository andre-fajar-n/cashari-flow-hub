import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface MoneySummaryItem {
  wallet_id: number | null;
  wallet_name: string | null;
  goal_id: number | null;
  goal_name: string | null;
  instrument_id: number | null;
  instrument_name: string | null;
  asset_id: number | null;
  asset_name: string | null;
  original_currency_code: string | null;
  saldo: number | null;
  base_currency_code: string | null;
  latest_rate: number | null;
  rate_date: string | null;
  amount_unit: number | null;
  latest_asset_value: number | null;
  asset_value_date: string | null;
  user_id: string | null;
}

export interface WalletSummary {
  wallet_id: number;
  wallet_name: string;
  items: MoneySummaryItem[];
  totalByOriginalCurrency: Record<string, number>;
  totalByBaseCurrency: Record<string, number>;
}

export interface CurrencyTotal {
  currency_code: string;
  total_amount: number;
}

export interface MoneySummaryData {
  walletSummaries: WalletSummary[];
  totalsByOriginalCurrency: CurrencyTotal[];
  totalsByBaseCurrency: CurrencyTotal[];
}

export const useMoneySummary = () => {
  const { user } = useAuth();

  return useQuery<MoneySummaryData>({
    queryKey: ["money-summary", user?.id],
    queryFn: async () => {
      if (!user) return { walletSummaries: [], totalsByOriginalCurrency: [], totalsByBaseCurrency: [] };

      const { data, error } = await supabase
        .from("money_summary")
        .select("*")
        .eq("user_id", user.id)
        .order("wallet_name", { ascending: true })
        .order("goal_name", { ascending: true })
        .order("instrument_name", { ascending: true })
        .order("asset_name", { ascending: true });

      if (error) {
        console.error("Failed to fetch money summary", error);
        throw error;
      }

      const items = data || [];

      // Group by wallet
      const walletGroups = items.reduce((acc, item) => {
        const walletId = item.wallet_id;
        if (!walletId) return acc;

        if (!acc[walletId]) {
          acc[walletId] = {
            wallet_id: walletId,
            wallet_name: item.wallet_name || "",
            items: [],
            totalByOriginalCurrency: {},
            totalByBaseCurrency: {}
          };
        }

        acc[walletId].items.push(item);

        // Calculate amounts
        const originalAmount = calculateAmount(item);
        const baseAmount = calculateBaseAmount(item);

        // Sum by original currency
        if (item.original_currency_code && originalAmount > 0) {
          acc[walletId].totalByOriginalCurrency[item.original_currency_code] = 
            (acc[walletId].totalByOriginalCurrency[item.original_currency_code] || 0) + originalAmount;
        }

        // Sum by base currency
        if (item.base_currency_code && baseAmount > 0) {
          acc[walletId].totalByBaseCurrency[item.base_currency_code] = 
            (acc[walletId].totalByBaseCurrency[item.base_currency_code] || 0) + baseAmount;
        }

        return acc;
      }, {} as Record<number, WalletSummary>);

      const walletSummaries = Object.values(walletGroups);

      // Calculate grand totals
      const totalsByOriginalCurrency: Record<string, number> = {};
      const totalsByBaseCurrency: Record<string, number> = {};

      items.forEach(item => {
        const originalAmount = calculateAmount(item);
        const baseAmount = calculateBaseAmount(item);

        if (item.original_currency_code && originalAmount > 0) {
          totalsByOriginalCurrency[item.original_currency_code] = 
            (totalsByOriginalCurrency[item.original_currency_code] || 0) + originalAmount;
        }

        if (item.base_currency_code && baseAmount > 0) {
          totalsByBaseCurrency[item.base_currency_code] = 
            (totalsByBaseCurrency[item.base_currency_code] || 0) + baseAmount;
        }
      });

      return {
        walletSummaries,
        totalsByOriginalCurrency: Object.entries(totalsByOriginalCurrency).map(([currency_code, total_amount]) => ({
          currency_code,
          total_amount
        })),
        totalsByBaseCurrency: Object.entries(totalsByBaseCurrency).map(([currency_code, total_amount]) => ({
          currency_code,
          total_amount
        }))
      };
    },
    enabled: !!user,
  });
};

// Helper function to calculate amount in original currency
const calculateAmount = (item: MoneySummaryItem): number => {
  // If there's asset value, use amount_unit * latest_asset_value
  if (item.amount_unit && item.latest_asset_value) {
    return item.amount_unit * item.latest_asset_value;
  }
  
  // Otherwise use saldo
  return item.saldo || 0;
};

// Helper function to calculate amount in base currency
const calculateBaseAmount = (item: MoneySummaryItem): number => {
  const originalAmount = calculateAmount(item);
  
  // If there's a rate, convert to base currency
  if (item.latest_rate && originalAmount > 0) {
    return originalAmount * item.latest_rate;
  }
  
  // If original currency is same as base currency, return original amount
  if (item.original_currency_code === item.base_currency_code) {
    return originalAmount;
  }
  
  return 0;
};

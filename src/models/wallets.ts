import { Database } from "@/integrations/supabase/types";
import { CurrencyModel } from "@/models/currencies";

export type WalletModel = Database["public"]["Tables"]["wallets"]["Row"] & {
  currency?: CurrencyModel;
};

// Partial wallet type used in relational queries
export type WalletPartial = {
  id: number;
  name: string;
  currency_code: string;
  initial_amount?: number | null;
  currencies?: { symbol: string };
};

import { Database } from "@/integrations/supabase/types";
import { CurrencyModel } from "@/models/currencies";

export type WalletModel = Database["public"]["Tables"]["wallets"]["Row"] & {
  currency: CurrencyModel;
};

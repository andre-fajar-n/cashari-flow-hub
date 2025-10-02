import { Database } from "@/integrations/supabase/types";
import { CurrencyModel } from "./currencies";

export type WalletModel = Database["public"]["Tables"]["wallets"]["Row"] & {
  currency: CurrencyModel;
};

import { Database } from "@/integrations/supabase/types";
import { CurrencyModel } from "@/models/currencies";

export type WalletModel = Database["public"]["Tables"]["wallets"]["Row"] & {
  currency?: CurrencyModel;
};

// Partial wallet type for relational queries - DRY using Pick<>
export type WalletRelation = Pick<WalletModel, "id" | "name" | "currency_code" | "initial_amount"> & {
  currencies?: Pick<CurrencyModel, "symbol">;
};

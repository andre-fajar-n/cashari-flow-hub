import { Database } from "@/integrations/supabase/types";
import { WalletModel } from "@/models/wallets";

// Partial wallet type for transfer relations - DRY using Pick<>
export type TransferWalletRelation = Pick<WalletModel, "id" | "name" | "currency_code">;

export type TransferModel = Database["public"]["Tables"]["transfers"]["Row"] & {
  from_wallet?: TransferWalletRelation;
  to_wallet?: TransferWalletRelation;
};

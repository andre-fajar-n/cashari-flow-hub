import { WalletModel } from "@/models/wallets";
import { Database } from "@/integrations/supabase/types";

export type TransferModel = Database["public"]["Tables"]["transfers"]["Row"] & {
  from_wallet: WalletModel;
  to_wallet: WalletModel;
};

import { Database } from "@/integrations/supabase/types";

export type WalletModel = Database["public"]["Tables"]["wallets"]["Row"];

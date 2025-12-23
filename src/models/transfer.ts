import { Database } from "@/integrations/supabase/types";

export type TransferWalletPartial = {
  id: number;
  name: string;
  currency_code: string;
  initial_amount?: number | null;
};

export type TransferModel = Database["public"]["Tables"]["transfers"]["Row"] & {
  from_wallet?: TransferWalletPartial;
  to_wallet?: TransferWalletPartial;
};

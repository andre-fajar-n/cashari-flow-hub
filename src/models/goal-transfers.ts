import { Database } from "@/integrations/supabase/types";
import { GoalRelation } from "@/models/goals";
import { WalletModel } from "@/models/wallets";
import { InvestmentInstrumentRelation } from "@/models/investment-instruments";
import { InvestmentAssetRelation } from "@/models/investment-assets";

export type GoalTransferModel = Database["public"]["Tables"]["goal_transfers"]["Row"];

// Type with relations for queries - DRY using relation types from models
export type GoalTransferWithRelations = GoalTransferModel & {
  from_goal?: GoalRelation | null;
  to_goal?: GoalRelation | null;
  from_wallet?: Pick<WalletModel, "name"> | null;
  to_wallet?: Pick<WalletModel, "name"> | null;
  from_instrument?: InvestmentInstrumentRelation | null;
  to_instrument?: InvestmentInstrumentRelation | null;
  from_asset?: InvestmentAssetRelation | null;
  to_asset?: InvestmentAssetRelation | null;
};

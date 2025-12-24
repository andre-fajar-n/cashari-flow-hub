import { Database } from "@/integrations/supabase/types";
import { GoalRelation } from "@/models/goals";
import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";
import { InvestmentInstrumentRelation } from "@/models/investment-instruments";
import { InvestmentAssetRelation } from "@/models/investment-assets";

export type GoalInvestmentRecordModel = Database["public"]["Tables"]["goal_investment_records"]["Row"];

// Type with relations for queries - DRY using relation types from models
export type GoalInvestmentRecordWithRelations = GoalInvestmentRecordModel & {
  goal?: GoalRelation | null;
  wallet?: Pick<WalletModel, "name" | "currency_code"> | null;
  category?: Pick<CategoryModel, "name" | "is_income"> | null;
  instrument?: InvestmentInstrumentRelation | null;
  asset?: InvestmentAssetRelation | null;
};

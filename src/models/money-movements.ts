import { Database } from "@/integrations/supabase/types";
import { InvestmentAssetModel } from "@/models/investment-assets";

export type MoneyMovementModel = Database["public"]["Views"]["money_movements"]["Row"] & {
  asset: InvestmentAssetModel;
};
import { Database } from "@/integrations/supabase/types";
import { InvestmentInstrumentModel, InvestmentInstrumentRelation } from "@/models/investment-instruments";

export type InvestmentAssetModel = Database["public"]["Tables"]["investment_assets"]["Row"] & {
  investment_instruments?: InvestmentInstrumentModel;
};

// Partial asset type for relational queries - DRY using Pick<>
export type InvestmentAssetRelation = Pick<InvestmentAssetModel, "name" | "symbol">;

// Asset with partial instrument relation
export type InvestmentAssetWithInstrument = Database["public"]["Tables"]["investment_assets"]["Row"] & {
  investment_instruments?: InvestmentInstrumentRelation;
};

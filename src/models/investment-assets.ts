import { Database } from "@/integrations/supabase/types";
import { InvestmentInstrumentModel } from "./investment-instruments";

export type InvestmentAssetModel = Database["public"]["Tables"]["investment_assets"]["Row"] & {
  investment_instruments: InvestmentInstrumentModel;
};

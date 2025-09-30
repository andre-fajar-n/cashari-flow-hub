import { Database } from "@/integrations/supabase/types";

export type InvestmentAssetValueModel = Database["public"]["Tables"]["investment_asset_values"]["Row"];

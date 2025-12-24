import { Database } from "@/integrations/supabase/types";

export type InvestmentInstrumentModel = Database["public"]["Tables"]["investment_instruments"]["Row"];

// Partial instrument type for relational queries - DRY using Pick<>
export type InvestmentInstrumentRelation = Pick<InvestmentInstrumentModel, "name">;

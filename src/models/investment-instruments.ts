import { Database } from "@/integrations/supabase/types";

export type InvestmentInstrumentModel = Database["public"]["Tables"]["investment_instruments"]["Row"];

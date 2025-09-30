import { Database } from "@/integrations/supabase/types";

export type CurrencyModel = Database["public"]["Tables"]["currencies"]["Row"];

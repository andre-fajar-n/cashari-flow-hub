import { Database } from "@/integrations/supabase/types";

export type DebtModel = Database["public"]["Tables"]["debts"]["Row"];

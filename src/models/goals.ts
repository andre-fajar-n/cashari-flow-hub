import { Database } from "@/integrations/supabase/types";

export type GoalModel = Database["public"]["Tables"]["goals"]["Row"];

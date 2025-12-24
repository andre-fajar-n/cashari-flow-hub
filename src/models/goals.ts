import { Database } from "@/integrations/supabase/types";

export type GoalModel = Database["public"]["Tables"]["goals"]["Row"];

// Partial goal type for relational queries - DRY using Pick<>
export type GoalRelation = Pick<GoalModel, "name">;

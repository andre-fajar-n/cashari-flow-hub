import { Database } from "@/integrations/supabase/types";

export type GoalTransferModel = Database["public"]["Tables"]["goal_transfers"]["Row"]
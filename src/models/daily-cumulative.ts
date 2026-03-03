import { Database } from "@/integrations/supabase/types";

export type DailyCumulative = Database["public"]["Views"]["daily_cumulative"]["Row"];
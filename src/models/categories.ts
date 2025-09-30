import { Database } from "@/integrations/supabase/types";

export type CategoryModel = Database["public"]["Tables"]["categories"]["Row"];
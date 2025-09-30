import { Database } from "@/integrations/supabase/types";

export type BusinessProjectModel = Database["public"]["Tables"]["business_projects"]["Row"];

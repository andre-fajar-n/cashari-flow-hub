import { Database } from "@/integrations/supabase/types";

export type BusinessProjectModel = Database["public"]["Tables"]["business_projects"]["Row"];
export type BusinessProjectSummaryModel = Database["public"]["Views"]["business_project_summary"]["Row"];

import { Database } from "@/integrations/supabase/types";
import { BusinessProjectModel } from "@/models/business-projects";

export type BusinessProjectTransactionModel = Database["public"]["Tables"]["business_project_transactions"]["Row"] & {
  business_projects: BusinessProjectModel;
};
